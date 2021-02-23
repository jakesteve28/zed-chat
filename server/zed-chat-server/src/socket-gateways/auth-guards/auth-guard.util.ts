export default function extractRefreshTokenFromCookie(cookies: string): string {
    if(cookies.includes('Refresh=')){
      const index = cookies.lastIndexOf('Refresh=') + 8;
      let i = index;
      let refreshToken = "";
      while(cookies[i] !== ';' &&
            cookies[i] !== ' ' &&
            i < cookies.length) {
        refreshToken += cookies[i++];
      }
      return refreshToken;
    } else return null;
  }
