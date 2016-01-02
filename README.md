# ngLiferay-login
The plugin exposes a directive `ng-liferay-login` to render login form, can be used as Tag or Attribute.

## Usages
* **As Tag:** Simple way to render inline Login.
```html
<ng-liferay-login></ng-liferay-login>
```
![Login inline](https://raw.githubusercontent.com/ngLiferay/ngLiferay-login/master/screenshots/Login_directive_basic.png)

* **As Attribute:** This is preferable way to open login in a popup. [UI Bootstrap](https://angular-ui.github.io/bootstrap/#/modal) modal is used for popup.
```html
<a href="#" ng-liferay-login="modal" data-modal="{size:''}">Sign In</a>
```
`data-modal` attribute is configuration object for UI Bootstrap modal. The above code is rendered as a `Sign In` link, clicking on which will open login in popup.
![Login Popup](https://raw.githubusercontent.com/ngLiferay/ngLiferay-login/master/screenshots/Login_directive_in_popup.png)

## How login works:
* First call is made to `AuthService.login` to process login of user.
*  Then `HelperService.getThemeDisplayJSON()` is called for getting user login status. If user logged in successfully, then `userSignedIn` event is broadcast in `$rootScope`, otherwise error is displayed.

### To Do's
* Support for user signup & forget password.
* Login by user name, if changed in Liferay's control panel.
* Support for other authentication schemes.
