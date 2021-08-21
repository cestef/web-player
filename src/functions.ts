import MediaTags, { Tags } from "jsmediatags";
import { MutableRefObject, SetStateAction } from "react";
import { PartialSong, Song } from "./components/App";

export const shuffleArray = (queue: Song[], currentSong: number) => {
  let currentIndex: number = queue.length,
    temporaryValue: Song,
    randomIndex: number,
    currentSongID: string = queue[currentSong].id;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = queue[currentIndex];
    queue[currentIndex] = queue[randomIndex];
    queue[randomIndex] = temporaryValue;
  }
  currentSong = queue.findIndex((e) => e.id === currentSongID);
  return { queue, currentSong };
};

export const getTags = (file: any) =>
  new Promise<Tags>((resolve, reject) => {
    MediaTags.read(file, {
      onSuccess: (data) => {
        resolve(data.tags);
      },
      onError: (err) => {
        if (err) resolve({});
      },
    });
  });

export const formatMilliseconds = (
  milliseconds: number,
  padStart: boolean = false
) => {
  const pad = (num: number) => {
    return `${num}`.padStart(2, "0");
  };
  let asSeconds = milliseconds / 1000;

  let hours = undefined;
  let minutes = Math.floor(asSeconds / 60);
  let seconds = Math.floor(asSeconds % 60);

  if (minutes > 59) {
    hours = Math.floor(minutes / 60);
    minutes %= 60;
  }

  return hours
    ? `${padStart ? pad(hours) : hours}:${pad(minutes)}:${pad(seconds)}`
    : `${padStart ? pad(minutes) : minutes}:${pad(seconds)}`;
};

export const mapQueueToSongList = (queue: Song[]): PartialSong[] =>
  queue.map((e) => ({
    name: e.file.name,
    id: e.id,
    tags: e.tags,
    coverURL: e.coverURL,
  }));

export const getBool = (key: string) => localStorage.getItem(key) === "true";
export const setBool = (key: string, value: boolean) =>
  localStorage.setItem(key, `${value}`);

export const playAudio = async ({
  setIsPlaying,
  setSongPlaying,
  currentSong,
  nextSong,
  ended,
  isPlayingStatic,
  queue,
  volume,
  audio,
  url,
  loop,
}: {
  lastPaused: MutableRefObject<number>;
  startTime: MutableRefObject<number>;
  setIsPlaying: (value: SetStateAction<boolean>) => void;
  setSongPlaying: (value: SetStateAction<string>) => void;
  currentSong: MutableRefObject<number>;
  nextSong: () => boolean;
  ended: MutableRefObject<boolean>;
  isPlayingStatic: MutableRefObject<boolean>;
  queue: MutableRefObject<Song[]>;
  url: string;
  volume: number;
  audio: MutableRefObject<HTMLAudioElement>;
  loop: boolean;
}) => {
  if (audio.current) audio.current.pause();
  audio.current = new Audio(url);
  audio.current.volume = volume;
  audio.current.loop = loop;
  ended.current = false;
  isPlayingStatic.current = true;
  setIsPlaying(true);
  setSongPlaying(queue.current[currentSong.current].file.name);
  audio.current.onended = () => {
    ended.current = nextSong();
  };
  audio.current.play();
};

export const genID = (len: number) => {
  let str = "";
  for (let i = 0; i <= len; i++) str += Math.random().toString(36).slice(2);
  return str;
};
