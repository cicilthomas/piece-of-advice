#  Piece of Advice - Alexa Skill

<img  src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png"  />


## About

This Alexa skill can give you random advices or advices on specific topics that you ask. The advices are fetched from [api.adviceslip.com](https://api.adviceslip.com/). 

### Sample utterances

* "Alexa, open piece of advice"
* "Give me an advice on life"
* "Advice me"



## Setup 

### Installation

1. Install and initialize the [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html?&sc_category=Owned&sc_channel=RD&sc_campaign=Evangelism2018&sc_publisher=github&sc_content=Content&sc_detail=hello-world-nodejs-V2_CLI-1&sc_funnel=Convert&sc_country=WW&sc_medium=Owned_RD_Evangelism2018_github_Content_hello-world-nodejs-V2_CLI-1_Convert_WW_beginnersdevs&sc_segment=beginnersdevs)
2.  **Make sure** you are running the latest version of the CLI
```bash

npm update -g ask-cli

```
3.  **Clone** the repository and navigate into the skill's root directory.

```bash

ask new --url https://github.com/cicilthomas/piece-of-advice.git --skill-name piece-of-advice

cd piece-of-advice

```
4. Install npm dependencies by navigating into the `/lambda/custom` directory and running the npm command: `npm install`.

```bash

cd lambda/custom

npm install

```
### Deployment

ASK CLI **will create the skill and the Lambda function for you**. The Lambda function will be created in ```us-east-1 (Northern Virginia)``` by default.

1. Navigate to the project's root directory. you should see a file named 'skill.json' there.

2. Deploy the skill and the Lambda function in one step by running the following command:

```bash

ask deploy

```

### Testing

1. To test, the skill needs to be enabled. From the developer console, open your skill and click the Test tab. Ensure the skill is available for testing in Development.

2. Access the **Alexa Simulator**, by selecting the **Test** tab from the top navigation menu. Your browser may request permission to access your microphone. While it is recommended to do so, it is not required. Do note that if you don't allow access to the microphone, you must type your utterances to Alexa in the simulator.

3. Notice the dropdown labeled "Skill testing is enabled in:", found just underneath the top navigation menu.

Toggle the dropdown from **Off** to **Development**.

4. To validate that your skill is working as expected, invoke your skill from the **Alexa Simulator** just below. You can either type or click and hold the mic from the input box to use your voice.

5.  **Type** "Open" followed by the invocation name.
```bash
Open piece of advice
```
6. Ensure your skill works the way that you designed it to.
*  *Tip: Always finish your test by saying "stop" to formally end your session.*
* After you interact with the Alexa Simulator, you should see the Skill I/O **JSON Input** and **JSON Output** boxes get populated with JSON data. You can also view the **Device Log** to trace your steps.

* If it's not working as expected, you can dig into the JSON to see exactly what Alexa is sending and receiving from the endpoint. If something is broken, you can find the error in AWS Cloudwatch.

7. Troubleshooting with CloudWatch log messages: You can add console.log() statements to your code, to track what is happening as your code executes, and help to figure out what is happening when something goes wrong.

## Additional Resources

### Community

*  [Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html) - Join the conversation!

*  [Hackster.io](https://www.hackster.io/amazon-alexa) - See what others are building with Alexa.

### Tutorials & Guides

*  [Voice Design Guide](https://developer.amazon.com/designing-for-voice/) - A great resource for learning conversational and voice user interface design.

*  [Codecademy: Learn Alexa](https://www.codecademy.com/learn/learn-alexa) - Learn how to build an Alexa Skill from within your browser with this beginner friendly tutorial on Codecademy!
  

### Documentation

*  [Official Alexa Skills Kit Node.js SDK](https://www.npmjs.com/package/ask-sdk) - The Official Node.js SDK Documentation

*  [Official Alexa Skills Kit Documentation](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html) - Official Alexa Skills Kit Documentation