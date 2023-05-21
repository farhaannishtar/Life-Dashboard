// next-auth.config.js

export default {
  providers: [
    {
      id: 'fitbit',
      name: 'Fitbit',
      type: 'oauth',
      version: '2.0',
      scope: 'weight profile', // Add any additional scopes you need
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: 'https://api.fitbit.com/oauth2/token',
      authorizationUrl: 'https://www.fitbit.com/oauth2/authorize?response_type=code',
      profileUrl: 'https://api.fitbit.com/1/user/-/profile.json',
      profile: (profile) => {
        return {
          id: profile.user.encodedId,
          name: profile.user.displayName,
          email: profile.user.email,
          image: profile.user.avatar,
        };
      },
      clientId: process.env.FITBIT_CLIENT_ID,
      clientSecret: process.env.FITBIT_CLIENT_SECRET,
    },
  ],
};
