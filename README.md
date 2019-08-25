
  
# Node.js Authentication made right

Just a simple Node.js Authentification periodically-token-based with Passport

* [Install](#install)
* [Usage](#usage)
 
## Install
##### clone and install npm dependencies:

    npm install

##### Run the database servers (must have docker installed ) with:
```
docker-compose up
```
##### Run the project with:
```
node server.js
```
## Usage
####  the Node.js part
We have an express server that is running on port 3000 and have its routes **/routes/auth.js** & **/routes/home.js**, auth.js routes file contains two Post calls, /auth/register and /auth/login, the latter just have a protected route (Get: /home ).
to register, follow this json structure : 
``` json
{
	"firstname":"chehir",
	"lastname":"dhawedi",
	"email":"chehir@fivepoints.fr",
	"password":"123456789"
}
```

the login api call is more interesting tho, 
```json
{
	"firstname":"chehir",
	"lastname":"dhawedi",
	"email":"chehir@fivepoints.fr",
	"password":"123456789",
	"remember_me":true
}
```
As you can see, we add the remember_me key to the login json body, the passport.authenticate method is making the whole auth job for us, and the whole logic is in the **passport.module.js file** .

The latter file describe two Passport-Strategies : 
- A standard LocalStrategy to check the user credentials on login : 

``` javascript
passport.use(new  LocalStrategy(
	{ usernameField:  "email", passwordField:  "password" },
	async (username, password, done) => {
		const  userResult  =  await  userModel.findOne({ email:  username }).exec();
		if (!userResult) { return  done(null, false, { message:  'User not found' }); }
		if (!userResult.comparePassword(password, userResult.password)) { return  done(null, false, { 																						message:  'Bad password' }); }
		userResult.password  =  '';
		return  done(null, userResult);
	}
));
```

- a RememberMeStrategy that takes in consideration the added key (remember_me) in the json body of the login call :
```javascript
passport.use(new  RememberMeStrategy(
	{ usernameField:  "email", passwordField:  "password" },
	async (token, done) => {
		const  userId  =  await  client.get(token);
		if (!userId) { await  accessModel.deleteOne({ token }).exec(); return  done(null, false); }
		const  user  =  await  userModel.findById(userId).exec()
		user['password'] =  '';
		delete  user['password']; // this did not work
		return  done(null, user);
	},
	issueToken
));
```
The flow is simple : once the user is authenticated, a token is generated (using the uuid module), that token is linked to the userId using the mongoose model accessModel, after that we store the token (as a key) with the userId (as a value) in a Redis database with expiration type ( i kept it 20 seconds, just to make you change it), then in every api call we check if we still have the token in the redis database or not, if its expired, the api call gets the fancy unauthorized message !  

## Contribution

You can fork project from github. Pull requests are kindly accepted.
1. npm install
3. node server.js
