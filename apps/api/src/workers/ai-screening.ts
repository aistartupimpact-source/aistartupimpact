import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AiEvaluationResponse {
  qualityScore: number;
  spamFlag: boolean;
  completeness: number;
  suggestedEdits: string[];
}

export async function evaluateAndRouteToolSubmission(toolId: string) {
  try {
    const tool = await prisma.aiTool.findUnique({ where: { id: toolId } });
    if (!tool) {
      console.error(`Tool ${toolId} not found for AI screening.`);
      return;
    }

    if (tool.status !== 'PENDING') {
      console.log(`Tool ${toolId} is already ${tool.status}. Skipping AI Eval.`);
      return;
    }

    console.log(`Starting AI Screening for tool: ${tool.name}`);

    // Call OpenAI
    const openAiKey = process.env.OPENAI_API_KEY;
    let evalData: AiEvaluationResponse = {
      qualityScore: 50,
      spamFlag: false,
      completeness: 50,
      suggestedEdits: ["Add more details to description."]
    };

    if (openAiKey) {
      const prompt = `You are an expert AI Directory Editor. Evaluate this tool submission for quality, completeness, and spam.
Tool Name: ${tool.name}
Tagline: ${tool.tagline}
Description: ${tool.description}
URL: ${tool.websiteUrl}

Return only JSON with this exact structure:
{
  "qualityScore": <number 0-100 indicating clarity and positioning>,
  "spamFlag": <boolean true if keyword stuffing or suspicious>,
  "completeness": <number 0-100 percentage>,
  "suggestedEdits": [<array of specific strings suggesting verbatim edits>]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          response_format: { type: 'json_object' },
          messages: [{ role: 'system', content: prompt }]
        })
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices[0].message.content;
        evalData = JSON.parse(content);
      } else {
        console.error('OpenAI API Error:', await response.text());
      }
    } else {
      console.warn('OPENAI_API_KEY missing. Using fallback evaluation.');
    }

    // 2. Routing Engine Logic
    let newStatus = 'PENDING';
    const holdsHighQuality = evalData.qualityScore >= 80 && !evalData.spamFlag;

    if (holdsHighQuality) {
      newStatus = 'APPROVED';
    }

    await prisma.aiTool.update({
      where: { id: toolId },
      data: {
        aiQualityScore: evalData.qualityScore,
        aiSpamFlag: evalData.spamFlag,
        aiSuggestedEdits: evalData.suggestedEdits,
        status: newStatus as any
      }
    });

    console.log(`Evaluation complete. New status: ${newStatus} (Score: ${evalData.qualityScore})`);

    // 3. Automated Emails Triggering
    if (newStatus === 'APPROVED') {
      // dispatchToolLiveEmail(tool.email, tool);
      console.log('Sending Tool Live Auto-Badge Email');
    } else {
      // dispatchActionNeededEmail(tool.email, tool, evalData.suggestedEdits);
      console.log('Sending Action Needed Email with exact edits:', evalData.suggestedEdits);
    }

    return true;

  } catch (error) {
    console.error('AI Screening Engine failed safely:', error);
  }
}
