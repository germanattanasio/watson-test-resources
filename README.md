# Watson apis test resources
Web application to host audio, images, text files (See `public/resources`)
that can be use to test the Watson APIs

Demo: https://watson-test-resources.mybluemix.net

## Getting Started

1. Create a Bluemix Account

    [Sign up][sign_up] in Bluemix, or use an existing account. Watson Services in Beta are free to use.

2. Download and install the [Cloud-foundry CLI][cloud_foundry] tool

3. Edit the `manifest.yml` file and change the `<application-name>` to something unique.
  ```none
  applications:
  - name: <application-name>
    command: node app.js
    path: .
    memory: 256M
  ```
  The name you use will determinate your application url initially, e.g. `<application-name>.mybluemix.net`.

4. Install [Node.js](http://nodejs.org/)

5. Install project dependencies and build browser application:
  ```sh
  $ npm install
  ```

6. Connect to Bluemix in the command line tool.
  ```sh
  $ cf api https://api.ng.bluemix.net
  $ cf login -u <your user ID>
  ```

7. Create the Watson APIs
  ```sh
  $ sh create-services.sh
  ```

8. Push it live!
  ```sh
  $ cf push
  ```

## Running locally

  The application uses [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/) so you will have to download and install them as part of the steps below.

  1. Install [Node.js](http://nodejs.org/)

  2. To install project dependencies, go to the project folder in a terminal and run:
      ```sh
      $ npm install
      ```

  3. Start the application:
      ```sh
      $ node app.js
      ```

  4. Go to: [http://localhost:3000](http://localhost:3000)

## Troubleshooting

To troubleshoot your Bluemix app the main useful source of information are the logs, to see them, run:

  ```sh
  $ cf logs <application-name> --recent
  ```

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

### License
 Apache 2.0

[cloud_foundry]: https://github.com/cloudfoundry/cli
[sign_up]: https://console.ng.bluemix.net/registration/