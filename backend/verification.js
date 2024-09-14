import OpenAI from "openai";
import sharp from 'sharp';

const mockImageModelCall = false;

const openai = new OpenAI();


export const verifyImage = async (imageAsBase64, promptSustainableAction) => {
    const prompt = `You will be given an image and a sustainable action. If the image shows evidence of completing the sustainable action, then you should verify the image, otherwise reject it. Response in the format \`\`\`{"verifiedSustainable": <BOOL>, "reason": "<STRING>""}\`\`\`
    
    promptSustainableAction: ${promptSustainableAction}`;

    if (mockImageModelCall) {
        console.log('mocking image model call, returning verifiedSustainable: true')
        return {
            verifiedSustainable: true,
            reason: 'Successfully verified.',
        };
    }

    const reducedImageAsBase64 = await resizeImage(imageAsBase64);

    const reduceB64WithPrefix = imageAsBase64.split(';base64,')[0] + ';base64,' + reducedImageAsBase64;

    const response = await openai.chat.completions.create({
        // model: "gpt-4-vision-preview",
        model: "gpt-4o",
        max_tokens: 150,
        messages: [
            {
                role: "system",
                content: [
                    { type: "text", text: prompt },
                ]
            },
            {
                role: "user",
                content: [
                    // { type: "text", text: userLevelMessage },
                    {
                        type: "image_url",
                        image_url: {
                            "url": reduceB64WithPrefix,
                        },
                    },
                ],
            },
        ],
      });

    const llmResponse = response.choices[0].message.content;
    console.log('llmResponse', llmResponse);

    const jsonFromLLM = attemptParseJsonFromLLM(llmResponse);
    if (jsonFromLLM === null) {
        console.log('failed to parse json from llm');
        console.log('llmResponse', llmResponse);

        return {
            verifiedSustainable: false,
            reason: 'Failed to verify image. Please try again.',
            internalMessage: "Failed to parse response from LLM",
        };
    }

    console.log('successfully parsed json from llm')
    console.log(jsonFromLLM);

    if (jsonFromLLM.verifiedSustainable === true) {
        return {
            verifiedSustainable: true,
            reason: jsonFromLLM.reason,
        };
    }

    return {
        verifiedSustainable: false,
        reason: jsonFromLLM.reason,
        // failedVerificationMessage: jsonFromLLM.message,
    }
}

async function resizeImage(base64Image) {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const imgBuffer = Buffer.from(base64Data, 'base64');

    const resizedBuffer = await sharp(imgBuffer).resize(200).toBuffer();

    const resizedBase64 = resizedBuffer.toString('base64');
    return resizedBase64;
  }

const attemptParseJsonFromLLM = (llmResponse) => {
    let jsonStr;
    if (llmResponse.startsWith('```')) {
        let jsonStart;
        if (llmResponse.startsWith('```json')) {
            jsonStart = 7;
        } else {
            jsonStart = 3;
        }
        const jsonEnd = llmResponse.lastIndexOf('```');
        jsonStr = llmResponse.substring(jsonStart, jsonEnd);
    } else {
        jsonStr = llmResponse;
    }

    try {
        const json = JSON.parse(jsonStr);
        return json;
    } catch (e) {
        return null;
    }
}