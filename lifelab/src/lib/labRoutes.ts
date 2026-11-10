import { LAB_TOPICS, type Grade, type LabTopic } from './labCatalog';

export const gradePath = (grade: Grade) => `#/lab/${grade}`;
export const topicPath = (topic: LabTopic) => `${gradePath(topic.grade)}/${topic.id}`;

/** Resolve only exact catalog paths. An invalid child must never open another lab. */
export function resolveLabRoute(hash: string) {
  const path = hash.replace(/^#/, '').replace(/\/$/, '');
  if (!path || path === '/lab') return { invalid: false };
  const [section, gradePart, topicId, challengeId, ...extra] = path.replace(/^\//, '').split('/');
  const grade: Grade | undefined =
    section === 'lab' && gradePart === '8'
      ? 8
      : section === 'lab' && gradePart === '9'
        ? 9
        : undefined;
  const topic = LAB_TOPICS.find((item) => item.grade === grade && item.id === topicId);
  const challenge = topic?.challenges.find((item) => item.id === challengeId);
  const invalid =
    !grade ||
    extra.length > 0 ||
    (topicId !== undefined && !topic) ||
    (challengeId !== undefined && !challenge);
  return { grade, topic, challenge, invalid };
}
