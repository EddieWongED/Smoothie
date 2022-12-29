##### Typescript-Node.js Template

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
