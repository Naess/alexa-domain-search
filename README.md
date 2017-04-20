# Alexa Domain Search
An Alexa skill to help search and suggest available domain names.

This repo contains the `voice-interface` directory, which holds the configuration needed to register the Alexa skill with Amazon, and it contains the `src` directory which has the actual source code that will be the API that Alexa will be hitting for her responses.

### Installation
If you want to set this up with Amazon, register and configure your skill with Amazon using the intents and utterances from the `voice-interface` directory, then add the files from the `src` directory to an AWS Lambda function. Below explains some general steps on how to do that:
1. Create an Amazon Developer account at https://developer.amazon.com, where you can add a new Alexa skill with the Alexa Skill Kit
2. While adding the skill, you can use contents of `voice-interface/intent-schema.json` for the Intent Schema, and the `voice-interface/sample-utterances.txt` for the Sample Utterances.
5. Upload the contents of this `src` directory to an AWS Lambda function and add its ARN in the Alexa skill "Configuration" step, so that this Alexa skill will be set up to talk to that endpoint.

And that's it! You can now test sending some voice commands to your skill in the Test section of the Alexa skill set up, and register your skill with Amazon.

More detailed information about setting up an Alexa skill can be found here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/steps-to-build-a-custom-skill
