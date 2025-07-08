// // lib/notifications.ts
// import { pusherServer } from './pusher';

// export const triggerAdminNotification = async (type: string, profileId: string) => {
//   try {
//     await pusherServer.trigger('admin-channel', 'profile-notification', {
//       type,
//       profileId
//     });
//   } catch (error) {
//     console.error('Error triggering notification:', error);
//   }
// };