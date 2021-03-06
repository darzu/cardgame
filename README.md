1. Setup:
- Install git: https://git-scm.com
  - If you're on Windows, install GitBash with the default settings and use that for all the command line commands in the rest of this README
- Install typescript compiler: https://www.typescriptlang.org/#download-links
- Install vscode (recommended, not required): https://code.visualstudio.com/
- Sign in into or up for github: https://github.com/

2. Fork this repository.

3. Clone:
```
$ cd ~/repos/
$ git@github.com:YOUR_ACCOUNT_NAME/game-starter.git
```

4. Run typescript continuous compilation:
```
$ cd ~/repos/game-starter/
$ tsc -w
```

5. Run the server:
```
$ cd ~/repos/game-starter/docs
$ python -m SimpleHTTPServer 4321
```

6. Visit the webpage:
```
$ open http://localhost:4321
```

7. To build the game:
- Edit src/main.ts
- DON'T edit docs/main**.js**, it is automatically generated each time main**.ts** is changed
- Refresh the localhost:4321 webpage and your changes should show up!
- If your code has an error, you'll see it in the typescript console window

8. Save your changes:
```
$ git add --all .
$ git commit -m "describe your changes here"
$ git push
```
