## Typescript-Node.js Template

[![Build Badge](https://github.com/EddieWongED/nodejs-typescript-template/actions/workflows/build.yaml/badge.svg)](https://github.com/EddieWongED/nodejs-typescript-template/actions/workflows/build.yaml)
[![Eslint Badge](https://github.com/EddieWongED/nodejs-typescript-template/actions/workflows/eslint.yaml/badge.svg)](https://github.com/EddieWongED/nodejs-typescript-template/actions/workflows/eslint.yaml)

-   In VSCode settings, append the following to use eslint by default:

```json
{
	...
	"[typescript]": {
		"editor.defaultFormatter": "dbaeumer.vscode-eslint"
	},
	"[json]": {
		"editor.defaultFormatter": "dbaeumer.vscode-eslint"
	},
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"eslint.validate": ["typescript"],
	"editor.formatOnPaste": true,
	"editor.formatOnSave": true,
	"eslint.format.enable": true
}
```
