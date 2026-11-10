import { describe, expect, it } from 'vitest';
import { LAB_TOPICS } from './labCatalog';
import { gradePath, topicPath, resolveLabRoute } from './labRoutes';

describe('student library navigation', () => {
  it.each(['', '#/lab', '#/lab/'])('opens the grade selection at %s', (hash) => {
    expect(resolveLabRoute(hash)).toEqual({ invalid: false });
  });
  it.each([8, 9] as const)('has three topics and six challenges for grade %s', (grade) => {
    expect(resolveLabRoute(gradePath(grade))).toMatchObject({ grade, invalid: false });
    const topics = LAB_TOPICS.filter((topic) => topic.grade === grade);
    expect(topics).toHaveLength(3);
    expect(topics.flatMap((topic) => topic.challenges)).toHaveLength(6);
    for (const topic of topics) {
      expect(resolveLabRoute(topicPath(topic))).toMatchObject({ topic, invalid: false });
      for (const challenge of topic.challenges) {
        expect(resolveLabRoute(`${topicPath(topic)}/${challenge.id}`)).toMatchObject({
          grade,
          topic,
          challenge,
          invalid: false,
        });
      }
    }
  });
  it.each([
    '#/unknown',
    '#/lab/7',
    '#/lab/8/9.1',
    '#/lab/8/missing',
    '#/lab/8/8.2/missing',
    '#/lab/8/8.2/balance/extra',
    '#/lab/8//balance',
  ])('rejects an invalid route %s', (hash) => {
    expect(resolveLabRoute(hash).invalid).toBe(true);
  });
});
