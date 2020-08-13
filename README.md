# Synergy project

- [Branch Guidelines](#markdown-header-branch-guidelines)
- [Commit Message Guidelines](#markdown-header-git-commit-guidelines)
- [Push changes to the server](#markdown-header-push-changes-to-the-server)
- [How to create frontend app](#markdown-header-how-to-create-frontend-app)


## Branch Guidelines

Make your changes in a new git branch.
```shell
$ git checkout -b fix/1234_bug-fix
```

### Branch Name Format
Each branch name must be name in special format:

```
<type>/<issue number>_<short_name>
```

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **test**: Adding missing or correcting existing tests
* **chore**: Changes to the build process or some other changes

### Issue number
**Optional** in case there is corresponding issue created

### Short name
Short name should be in Kebab Case

## Git Commit Guidelines

### Commit Message Format
Each commit message must be in special format:

```
<type>(<scope>): <subject>
```

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **test**: Adding missing or correcting existing tests
* **chore**: Changes to the build process or some other changes

### Scope
The scope specifies what part of project has been changed

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* capitalize first letter
* no dot (.) at the end

## Push changes to the server

### Git push
Push changes to remote using following `git` command:

```shell
$ git push -u origin fix/1234_bug-fix
```

Once push is done open new pull request and assign it to appropriate people.

## How to create frontend app

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.3.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

