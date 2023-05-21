// next-auth.config.js

export default {
  providers: [
    {
      id: "fitbit",
      name: "Fitbit",
      type: "oauth",
      version: "2.0",
      scope: "weight profile", // Add any additional scopes you need
      params: { grant_type: "authorization_code" },
      accessTokenUrl: "https://api.fitbit.com/oauth2/token",
      authorizationUrl: "https://www.fitbit.com/oauth2/authorize",
      profileUrl: "https://www.fitbit.com/user/6FCVD7",
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
