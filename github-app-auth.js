// GitHub App Authentication Module
// Implements proper GitHub App authentication with installation tokens and refresh

class GitHubAppAuth {
  constructor() {
    // GitHub App details
    this.appId = '2240370'; // GitHub App ID
    this.clientId = 'Iv23lizbV9HETLAax5VU'; // Client ID (preferred for OAuth)
    this.appSlug = 'ghclip'; // GitHub App slug
    this.deviceCodeUrl = 'https://github.com/login/device/code';
    this.accessTokenUrl = 'https://github.com/login/oauth/access_token';
    this.installUrl = 'https://github.com/apps/ghclip/installations/new';
  }

  /**
   * Check if user has installed the GitHub App
   * Returns installation info if installed
   */
  async checkInstallation(userToken) {
    try {
      const response = await fetch('https://api.github.com/user/installations', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check installations: ${response.statusText}`);
      }

      const data = await response.json();

      // Find our app installation
      const installation = data.installations?.find(
        inst => inst.app_slug === this.appSlug || inst.app_id === parseInt(this.appId)
      );

      return installation || null;
    } catch (error) {
      console.error('Error checking installation:', error);
      throw error;
    }
  }

  /**
   * Get user access token via Device Flow
   * This allows the extension to act on behalf of the user
   */
  async getUserToken() {
    // Start device flow
    const deviceFlow = await this.startDeviceFlow();

    return {
      deviceFlow,
      waitForToken: async () => {
        const tokenData = await this.pollForToken(
          deviceFlow.deviceCode,
          deviceFlow.interval
        );
        return tokenData.accessToken;
      }
    };
  }

  /**
   * Start the Device Flow for user authentication
   */
  async startDeviceFlow() {
    try {
      const response = await fetch(this.deviceCodeUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.clientId, // Use Client ID for OAuth
          scope: 'read:user'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Device flow failed:', response.status, errorText);
        throw new Error(`Failed to start device flow: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      return {
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresIn: data.expires_in,
        interval: data.interval
      };
    } catch (error) {
      console.error('Error starting device flow:', error);
      throw error;
    }
  }

  /**
   * Poll for user access token
   */
  async pollForToken(deviceCode, interval = 5) {
    const pollIntervalMs = interval * 1000;

    return new Promise((resolve, reject) => {
      const poll = setInterval(async () => {
        try {
          const response = await fetch(this.accessTokenUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              client_id: this.clientId, // Use Client ID for OAuth
              device_code: deviceCode,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
            })
          });

          const data = await response.json();

          if (data.error) {
            if (data.error === 'authorization_pending') {
              return; // Keep polling
            } else if (data.error === 'slow_down') {
              return; // Keep polling
            } else if (data.error === 'expired_token') {
              clearInterval(poll);
              reject(new Error('Device code expired. Please try again.'));
              return;
            } else if (data.error === 'access_denied') {
              clearInterval(poll);
              reject(new Error('Access denied by user.'));
              return;
            } else {
              clearInterval(poll);
              reject(new Error(`OAuth error: ${data.error_description || data.error}`));
              return;
            }
          }

          if (data.access_token) {
            clearInterval(poll);
            resolve({
              accessToken: data.access_token,
              tokenType: data.token_type,
              scope: data.scope,
              refreshToken: data.refresh_token,
              expiresIn: data.expires_in
            });
          }
        } catch (error) {
          clearInterval(poll);
          reject(error);
        }
      }, pollIntervalMs);

      // Timeout after 15 minutes
      setTimeout(() => {
        clearInterval(poll);
        reject(new Error('Authentication timeout. Please try again.'));
      }, 15 * 60 * 1000);
    });
  }

  /**
   * Get installation access token for API operations
   * Installation tokens expire after 1 hour
   */
  async getInstallationToken(userToken, installationId) {
    try {
      const response = await fetch(
        `https://api.github.com/user/installations/${installationId}/access_tokens`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to get installation token: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        token: data.token,
        expiresAt: data.expires_at,
        permissions: data.permissions,
        repositories: data.repositories
      };
    } catch (error) {
      console.error('Error getting installation token:', error);
      throw error;
    }
  }

  /**
   * Refresh installation token if expired
   */
  async refreshInstallationTokenIfNeeded(userToken, installationId, currentToken, expiresAt) {
    const now = new Date();
    const expiry = new Date(expiresAt);

    // Refresh 5 minutes before expiry
    const refreshThreshold = new Date(expiry.getTime() - 5 * 60 * 1000);

    if (now >= refreshThreshold) {
      console.log('Installation token expired or expiring soon, refreshing...');
      return await this.getInstallationToken(userToken, installationId);
    }

    return {
      token: currentToken,
      expiresAt: expiresAt
    };
  }

  /**
   * Get user information
   */
  async getUserInfo(token) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  /**
   * List repositories accessible by the installation
   */
  async getInstallationRepositories(installationToken) {
    try {
      const response = await fetch(
        'https://api.github.com/installation/repositories?per_page=100',
        {
          headers: {
            'Authorization': `token ${installationToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get repositories: ${response.statusText}`);
      }

      const data = await response.json();
      return data.repositories || [];
    } catch (error) {
      console.error('Error getting repositories:', error);
      throw error;
    }
  }

  /**
   * Create a new repository (requires user token with repo scope)
   */
  async createRepository(userToken, repoName, isPrivate = true, description = '') {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          description: description || 'Links saved with GHClip Chrome Extension',
          private: isPrivate,
          auto_init: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to create repository: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating repository:', error);
      throw error;
    }
  }

  /**
   * Add repository to installation (grant app access)
   */
  async addRepositoryToInstallation(userToken, installationId, repositoryId) {
    try {
      const response = await fetch(
        `https://api.github.com/user/installations/${installationId}/repositories/${repositoryId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add repository to installation: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error adding repository to installation:', error);
      throw error;
    }
  }

  /**
   * Get the installation URL for user to install the app
   */
  getInstallationUrl(repositoryFullName = null) {
    if (repositoryFullName) {
      return `https://github.com/apps/${this.appSlug}/installations/new?repository=${repositoryFullName}`;
    }
    return `https://github.com/apps/${this.appSlug}/installations/new`;
  }

  /**
   * Complete authentication flow
   */
  async authenticate() {
    // Get user token first
    const userTokenFlow = await this.getUserToken();

    return {
      deviceFlow: userTokenFlow.deviceFlow,
      waitForAuth: async () => {
        // Wait for user to authorize
        const userToken = await userTokenFlow.waitForToken();

        // Get user info
        const userInfo = await this.getUserInfo(userToken);

        // Check if app is installed
        const installation = await this.checkInstallation(userToken);

        return {
          userToken,
          userInfo,
          installation,
          needsInstallation: !installation
        };
      }
    };
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubAppAuth;
}
