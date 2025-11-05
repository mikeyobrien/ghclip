// GitHub OAuth Authentication Module
// Implements GitHub Device Flow for Chrome Extension authentication

class GitHubAuth {
  constructor() {
    this.clientId = 'Ov23liLPKTwWGlI9FBZX'; // GHClip public client ID
    this.deviceCodeUrl = 'https://github.com/login/device/code';
    this.accessTokenUrl = 'https://github.com/login/oauth/access_token';
    this.pollInterval = 5000; // 5 seconds
  }

  /**
   * Start the OAuth Device Flow
   * Returns device code and user code for authorization
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
          client_id: this.clientId,
          scope: 'repo user'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start device flow: ${response.statusText}`);
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
   * Poll for access token after user authorizes
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
              client_id: this.clientId,
              device_code: deviceCode,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
            })
          });

          const data = await response.json();

          if (data.error) {
            if (data.error === 'authorization_pending') {
              // Still waiting for user to authorize
              return;
            } else if (data.error === 'slow_down') {
              // Increase poll interval
              console.log('Slowing down polling');
              return;
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
              scope: data.scope
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
   * Get user information using access token
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
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
   * Get list of repositories accessible to the user
   */
  async getRepositories(accessToken, page = 1, perPage = 100) {
    try {
      const response = await fetch(
        `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator`,
        {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get repositories: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting repositories:', error);
      throw error;
    }
  }

  /**
   * Create a new repository for the user
   */
  async createRepository(accessToken, repoName, isPrivate = true, description = '') {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${accessToken}`,
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
   * Complete OAuth flow and return access token and user info
   */
  async authenticate() {
    // Start device flow
    const deviceFlow = await this.startDeviceFlow();

    // Return device flow info so UI can show user code
    return {
      deviceFlow,
      waitForToken: async () => {
        // Wait for user to authorize
        const tokenData = await this.pollForToken(
          deviceFlow.deviceCode,
          deviceFlow.interval
        );

        // Get user info
        const userInfo = await this.getUserInfo(tokenData.accessToken);

        return {
          accessToken: tokenData.accessToken,
          user: userInfo
        };
      }
    };
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubAuth;
}
