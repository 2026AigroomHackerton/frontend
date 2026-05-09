// EditorPage 전용 mock AI 모듈.
// 실제 API 호출 없이 명령어 키워드에 따라 가짜 수정 결과를 만들어낸다.

export type MockAiResult = {
  before: string;
  after: string;
  changes: string[];
};

// 명령어 키워드 분기로 mock 결과 생성
export const generateMockAiResult = async (
  bodyText: string,
  command: string,
): Promise<MockAiResult> => {
  // 처리 중 상태를 보여주기 위한 짧은 지연
  await new Promise((resolve) => setTimeout(resolve, 800));

  const trimmed = command.trim();

  // 요약 명령
  if (trimmed.includes('요약')) {
    const lines = bodyText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const summary = lines.slice(0, Math.min(3, lines.length)).join(' / ');
    return {
      before: bodyText,
      after: `[요약]\n${summary || '문서의 핵심 내용을 간단히 정리했습니다.'}`,
      changes: [
        '핵심 내용을 중심으로 문장을 줄였습니다.',
        '중복된 표현과 부가 설명을 제거했습니다.',
      ],
    };
  }

  // 공손한 문체 명령
  if (trimmed.includes('공손')) {
    const polite = bodyText
      .replace(/안녕하세요\.?/g, '안녕하십니까.')
      .replace(/합니다\.?/g, '드립니다.')
      .replace(/바랍니다\.?/g, '부탁드립니다.');
    return {
      before: bodyText,
      after: polite,
      changes: [
        '문체를 공손하게 변경했습니다.',
        '"합니다" 표현을 "드립니다" 형태로 다듬었습니다.',
      ],
    };
  }

  // 보고서 형식 명령
  if (trimmed.includes('보고서')) {
    const after = [
      '제목: 문서 보고',
      '',
      '개요:',
      '- 본 문서는 사용자 요청에 따라 보고서 형식으로 정리되었습니다.',
      '',
      '내용:',
      bodyText,
      '',
      '결론:',
      '- 위 내용을 바탕으로 후속 조치를 진행할 예정입니다.',
    ].join('\n');
    return {
      before: bodyText,
      after,
      changes: [
        '문서 구조를 보고서 형식으로 정리했습니다.',
        '제목 / 개요 / 내용 / 결론 단락을 추가했습니다.',
      ],
    };
  }

  // 맞춤법 / 띄어쓰기 명령
  if (trimmed.includes('맞춤법') || trimmed.includes('띄어쓰기')) {
    const cleaned = bodyText
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+\./g, '.')
      .replace(/\s+,/g, ',')
      .replace(/되요/g, '돼요')
      .replace(/됬/g, '됐');
    return {
      before: bodyText,
      after: cleaned,
      changes: [
        '맞춤법과 띄어쓰기를 다듬었습니다.',
        '불필요한 공백과 자주 틀리는 표현을 정리했습니다.',
      ],
    };
  }

  // 기본 명령 처리
  return {
    before: bodyText,
    after: `${bodyText}\n\n[AI 보강] 요청하신 "${trimmed}" 내용을 반영해 정리했습니다.`,
    changes: [
      `명령("${trimmed}")에 따라 문서를 수정했습니다.`,
      '문서 끝에 보강 문단을 추가했습니다.',
    ],
  };
};
