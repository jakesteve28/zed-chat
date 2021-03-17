/** 
    2021 Jacob Stevens 
    An object used for creating a new user. 
    Employed by the User Controller class for the POST request on Creating an account.
*/

export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    session: string;
    tagName: string;
  }