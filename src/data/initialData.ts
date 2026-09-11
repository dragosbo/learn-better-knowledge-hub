import { Playlist } from '../types';
import channelPlaylistsRaw from './channelPlaylists.json';

export const INITIAL_PLAYLISTS: Playlist[] = channelPlaylistsRaw as Playlist[];
