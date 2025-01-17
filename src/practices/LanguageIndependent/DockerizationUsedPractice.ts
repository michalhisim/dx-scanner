import { IPractice } from '../IPractice';
import { PracticeEvaluationResult, PracticeImpact } from '../../model';
import { DxPractice } from '../DxPracticeDecorator';
import { PracticeContext } from '../../contexts/practice/PracticeContext';

@DxPractice({
  id: 'LanguageIndependent.DockerizationUsed',
  name: 'DockerizationUsed',
  impact: PracticeImpact.small,
  suggestion: 'Use docker to create, deploy, and run applications easier by using containers.',
  reportOnlyOnce: true,
  url: 'https://docs.docker.com/get-started/',
})
export class DockerizationUsedPractice implements IPractice {
  async isApplicable(): Promise<boolean> {
    return true;
  }

  async evaluate(ctx: PracticeContext): Promise<PracticeEvaluationResult> {
    if (ctx.fileInspector === undefined) {
      return PracticeEvaluationResult.unknown;
    }

    const regexDocker = new RegExp(/dockerfile|docker-compose\.yml/, 'i');
    const docker = await ctx.fileInspector.scanFor(regexDocker, '/');
    if (docker.length > 0) {
      return PracticeEvaluationResult.practicing;
    }

    return PracticeEvaluationResult.notPracticing;
  }
}
