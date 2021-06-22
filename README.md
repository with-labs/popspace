# unicorn
An OT-based collaborative editor.

Relies on Quill and ShareDb.

# Next steps
- [ ] Authenticate to edit - anyone in room


# Packaging
Collaborative editing requires a client and a server.

It's nice to be able to extract collaborative editing into its own microservice, to enable its coding standards and tests to live separately from core services.

It's also nice to be able to test and develop the actual text editor separately from the main app.

However, to actually integrate the text editor into the With application, the editor needs to be imported into the With client app.

The solution we'd like to shoot for is to wrap the collaborative text editor view into an npm package that can be installed into the With client. The editor lives in the same repo as the backend for it, but has its own package.json which is used to publish it to npm.

## Development hurdles
Turns out, it's quite tricky to test changes to a react component locally.

E.g.
https://stackoverflow.com/questions/64283813/invalid-hook-call-on-npm-link-library
https://github.com/facebook/react/issues/13991#issuecomment-435135293
https://stackoverflow.com/questions/57825421/invalid-hook-call-warning-linking-a-react-app-and-a-local-npm-package

I.e. hooks don't work with npm/yarn link. It seems they have a conflict of react versions.

There's an alternative to npm/yarn link

https://github.com/wclr/yalc
https://www.viget.com/articles/how-to-use-local-unpublished-node-packages-as-project-dependencies/

It could also be possible to resolve this issue with
alias: {
  react: path.resolve('./node_modules/react')
}

in the With webpack config ( https://github.com/facebook/react/issues/13991#issuecomment-435587809 )

# Relevant links
https://dev.to/kannndev/let-s-build-a-collaborative-rich-text-editor-32n3
https://github.com/reedsy/quill-cursors
https://github.com/pedrosanta/quill-sharedb-cursors
https://github.com/pedrosanta/quill-sharedb-cursors#ongoing-quill-cursor-efforts-and-discussion



# Localhost HTTPS
(From: https://web.dev/how-to-use-local-https/)

For MacOS:

```bash
brew install mkcert
brew install nss # for Firefox
mkcert -install
mkdir mkcert     # inside the root of this project
cd mkcert
mkcert localhost
```

Then set environment variables for your new cert:

```bash
SSL_PRIVATE_KEY_PATH = mkcert/localhost-key.pem
SSL_CERTIFICATE_PATH = mkcert/localhost.pem
```
