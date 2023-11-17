import Pusher from 'pusher-js';

export const pusher = new Pusher('c399a52d3d6db8ab5b1b', {
  cluster: 'eu',
  encrypted: true,
});