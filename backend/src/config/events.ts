import { EventEmitter } from 'events';
import logger from './logger';

export const blogEvents = new EventEmitter();
blogEvents.setMaxListeners(50);

export const BlogEventTypes = {
  POST_PUBLISHED: 'post:published',
  POST_SCHEDULED: 'post:scheduled',
  POST_UPDATED:   'post:updated',
  POST_TRASHED:   'post:trashed',
  POST_RESTORED:  'post:restored',
  POST_DELETED:   'post:deleted',
} as const;

// Default listener: log all events
blogEvents.on(BlogEventTypes.POST_PUBLISHED,  (data) => logger.info(`Post published: ${data.slug}`, { postId: data.postId }));
blogEvents.on(BlogEventTypes.POST_SCHEDULED,  (data) => logger.info(`Post scheduled: ${data.slug}`, { postId: data.postId }));
blogEvents.on(BlogEventTypes.POST_UPDATED,    (data) => logger.info(`Post updated: ${data.slug}`, { postId: data.postId }));
blogEvents.on(BlogEventTypes.POST_TRASHED,    (data) => logger.info(`Post trashed: ${data.slug}`, { postId: data.postId }));
blogEvents.on(BlogEventTypes.POST_RESTORED,   (data) => logger.info(`Post restored: ${data.slug}`, { postId: data.postId }));
blogEvents.on(BlogEventTypes.POST_DELETED,    (data) => logger.info(`Post deleted: ${data.slug}`, { postId: data.postId }));
