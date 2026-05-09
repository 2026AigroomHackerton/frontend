import type { AIRewriteResult } from '../types/document';

const POLITE_TONE = /공손|정중|존댓말/;
const SUMMARIZE = /요약|짧게|간단/;
const FORMAL = /격식|공식|딱딱/;

export const requestAIRewrite = async (
  content: string,
  command: string,
): Promise<AIRewriteResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!command.trim()) {
    throw new Error('명령을 입력해 주세요.');
  }
  if (!content.trim()) {
    throw new Error('편집할 문서 내용이 없습니다.');
  }

  let after = content;
  let explanation = '명령에 따라 문서를 다듬었습니다.';

  if (POLITE_TONE.test(command)) {
    after = content
      .replace(/합니다\.?/g, '드립니다.')
      .replace(/안녕하세요\.?/g, '안녕하십니까.')
      .replace(/바랍니다\.?/g, '부탁드립니다.');
    explanation = '문체를 더 공손한 표현으로 바꿨습니다. (예: "합니다" → "드립니다")';
  } else if (SUMMARIZE.test(command)) {
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    after = lines.slice(0, Math.max(3, Math.ceil(lines.length / 2))).join('\n');
    explanation = '핵심 줄만 남기고 분량을 축약했습니다.';
  } else if (FORMAL.test(command)) {
    after = content
      .replace(/안내드립니다\.?/g, '공지드립니다.')
      .replace(/입니다\.?/g, '입니다.');
    explanation = '격식 있는 공문 톤으로 정리했습니다.';
  } else {
    after = `${content}\n\n[AI 보강] "${command}" 요청을 반영해 문서를 정리했습니다.`;
    explanation = `사용자 명령("${command}")을 반영해 문서 끝에 정리 문단을 추가했습니다.`;
  }

  return {
    before: content,
    after,
    explanation,
  };
};
