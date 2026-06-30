use super::types::{LlmRequest, WritingAction, WritingMode};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BuiltPrompt {
    pub instruction: String,
}

pub fn build_prompt(request: &LlmRequest) -> BuiltPrompt {
    let action = action_instruction(request);
    let mode = mode_instruction(request.correction_mode);
    let levels = level_instruction(request);

    BuiltPrompt {
        instruction: format!(
            "You are FatFingers, a compact desktop writing assistant.\n\
             Return only the final text. Do not explain changes. Do not wrap the output in quotes.\n\
             {action}\n\
             {mode}\n\
             {levels}"
        ),
    }
}

fn action_instruction(request: &LlmRequest) -> String {
    match request.action {
        WritingAction::Correct => {
            "Task: correct spelling, grammar, punctuation and capitalization while preserving the user's meaning, wording style and language. Be conservative even if creativity is high.".to_string()
        }
        WritingAction::Professional => {
            "Task: rewrite the text with a professional tone, improving clarity and structure while preserving the original intent.".to_string()
        }
        WritingAction::Shorten => {
            "Task: make the text shorter while preserving the essential meaning and useful details.".to_string()
        }
        WritingAction::Friendly => {
            "Task: make the text warmer, friendlier and natural without sounding exaggerated.".to_string()
        }
        WritingAction::TranslateEnglish => {
            "Task: translate the text to natural English, preserving meaning and tone.".to_string()
        }
        WritingAction::TranslateSpanish => {
            "Task: translate the text to natural Spanish, preserving meaning and tone.".to_string()
        }
        WritingAction::QuickReply => {
            "Task: draft a brief reply as if written by the user. Respond to the incoming message; do not correct the incoming message itself.".to_string()
        }
        WritingAction::Custom => {
            let instruction = request
                .custom_instruction
                .as_deref()
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .unwrap_or("Apply the user's custom writing instruction.");

            format!("Task: {instruction}")
        }
    }
}

fn mode_instruction(mode: WritingMode) -> &'static str {
    match mode {
        WritingMode::PlainText => {
            "Mode: plain_text. Apply the requested change without explanations or creative additions."
        }
        WritingMode::Balanced => {
            "Mode: balanced. Improve naturalness while preserving meaning, tone and language."
        }
        WritingMode::Formal => {
            "Mode: formal. Prioritize clarity, professionalism and polished structure."
        }
        WritingMode::Creative => {
            "Mode: creative. Freer rewording is allowed, but the user's intent must remain unchanged."
        }
    }
}

fn level_instruction(request: &LlmRequest) -> String {
    let formality = request.formality_level.unwrap_or(50).min(100);
    let creativity = match request.action {
        WritingAction::Correct => request.creativity_level.unwrap_or(20).min(30),
        _ => request.creativity_level.unwrap_or(20).min(100),
    };

    format!("Formality level: {formality}/100. Creativity level: {creativity}/100.")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(action: WritingAction) -> LlmRequest {
        LlmRequest {
            action,
            input_text: "hello wrld".to_string(),
            custom_instruction: None,
            model: "model".to_string(),
            temperature: Some(0.2),
            max_output_tokens: Some(800),
            correction_mode: WritingMode::PlainText,
            formality_level: Some(50),
            creativity_level: Some(90),
        }
    }

    #[test]
    fn correct_is_conservative_even_with_high_creativity() {
        let prompt = build_prompt(&request(WritingAction::Correct));

        assert!(prompt.instruction.contains("Be conservative"));
        assert!(prompt.instruction.contains("Creativity level: 30/100"));
        assert!(prompt.instruction.contains("Return only the final text"));
    }

    #[test]
    fn quick_reply_does_not_correct_incoming_message() {
        let prompt = build_prompt(&request(WritingAction::QuickReply));

        assert!(prompt.instruction.contains("draft a brief reply"));
        assert!(prompt
            .instruction
            .contains("do not correct the incoming message"));
    }

    #[test]
    fn professional_shortens_and_friendly_have_action_templates() {
        let professional = build_prompt(&request(WritingAction::Professional));
        let shorten = build_prompt(&request(WritingAction::Shorten));
        let friendly = build_prompt(&request(WritingAction::Friendly));

        assert!(professional.instruction.contains("professional tone"));
        assert!(shorten.instruction.contains("make the text shorter"));
        assert!(friendly.instruction.contains("warmer, friendlier"));
    }

    #[test]
    fn formal_mode_and_levels_are_reflected() {
        let mut llm_request = request(WritingAction::Professional);
        llm_request.correction_mode = WritingMode::Formal;
        llm_request.formality_level = Some(85);
        llm_request.creativity_level = Some(10);

        let prompt = build_prompt(&llm_request);

        assert!(prompt.instruction.contains("Mode: formal"));
        assert!(prompt.instruction.contains("Formality level: 85/100"));
        assert!(prompt.instruction.contains("Creativity level: 10/100"));
    }

    #[test]
    fn custom_uses_custom_instruction() {
        let mut llm_request = request(WritingAction::Custom);
        llm_request.custom_instruction = Some("Use a direct tone".to_string());

        let prompt = build_prompt(&llm_request);

        assert!(prompt.instruction.contains("Use a direct tone"));
    }
}
