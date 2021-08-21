import {
  Checkbox,
  FormGroup,
  FormLabel,
  Grid,
  List,
  makeStyles,
  Menu,
  MenuItem,
  Slider,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { Tags } from "jsmediatags";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { DropEvent, FileRejection } from "react-dropzone";
import {
  genID,
  getBool,
  getTags,
  mapQueueToSongList,
  playAudio,
  setBool,
  shuffleArray,
} from "../functions";
import { ControlsPropsType } from "./Controls";
import FileInput, { FileInputPropsType } from "./FileInput";
import Player, { PlayerPropsType } from "./Player";
import SongT, { SongPropsType } from "./Song";

const ACCEPT = [".mp3", ".mp4", ".m4v", ".flac", ".mov", ".ogg"];

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 20,
    margin: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    flexDirection: "column",
  },
  loading: {
    position: "relative",
    marginRight: 10,
    height: 30,
    width: 30,
  },
  songList: {
    marginTop: 20,
    maxWidth: "calc(100vw - 64px)",
  },
  volume: {
    overflowY: "hidden",
  },
  playerRoot: {
    [theme.breakpoints.up("lg")]: {
      position: "sticky",
      top: 0,
    },
  },
  listRoot: {
    marginTop: 20,
  },
  songListRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 30,
  },
  rightClick: {
    padding: "0px 6px",
  },
}));

export interface Song {
  file: File;
  id: string;
  tags: Tags;
  coverURL?: string;
  url: string;
}
export interface PartialSong {
  name: string;
  id: string;
  tags: Tags;
  coverURL?: string;
}

const App = ({
  setTheme,
}: {
  setTheme: (value: SetStateAction<string>) => void;
}) => {
  const classes = useStyles();
  const audio = useRef<HTMLAudioElement>();
  const queue = useRef<Song[]>([]);
  const currentSong = useRef<number>(-1);
  const ended = useRef<boolean>(false);
  const lastPaused = useRef<number>(0);
  const startTime = useRef<number>();
  const isPlayingStatic = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);

  const [anchorElVolume, setAnchorElVolume] = useState<null | HTMLElement>(
    null
  );
  const isVolumeMenuOpen = Boolean(anchorElVolume);
  const [anchorElSettings, setAnchorElSettings] = useState<null | HTMLElement>(
    null
  );
  const isSettingsMenuOpen = Boolean(anchorElSettings);
  const [clickMenuAnchorEl, setClickMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [clickMenuID, setClickMenuID] = useState<string>(null);
  const [progress, setProgress] = useState<{
    total: number;
    current: number;
  }>({
    total: 0,
    current: 0,
  });
  const [volume, setVolume] = useState<number>(100);
  const [songList, setSongList] = useState<PartialSong[]>([]);
  const [songPlaying, setSongPlaying] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [songProgress, setSongProgress] = useState<number>(0);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (
        queue.current[currentSong.current] &&
        isPlayingStatic.current &&
        !ended.current
      ) {
        setSongProgress(
          (audio.current.currentTime / audio.current.duration) * 100
        );
      } else if (songProgress !== 0 && ended.current) {
        setSongProgress(0);
      }
    }, 500);
    const titleInterval = setInterval(() => {
      if (songPlaying) document.title = songPlaying;
      else document.title = "cstef's Web Player";
    }, 5000);
    return () => {
      clearInterval(updateInterval);
      clearInterval(titleInterval);
    };
  }, [songPlaying, songProgress]);
  const initAudio = async (url: string, volume: number = 1) => {
    await playAudio({
      url,
      volume,
      queue,
      currentSong,
      nextSong,
      setIsPlaying,
      setSongPlaying,
      startTime,
      lastPaused,
      isPlayingStatic,
      ended,
      audio,
      loop,
    });
  };

  const nextSong = () => {
    if (queue.current[currentSong.current + 1]) {
      currentSong.current++;
      lastPaused.current = 0;
      initAudio(queue.current[currentSong.current].url);
      return false;
    } else {
      setIsPlaying(false);
      currentSong.current--;
      return true;
    }
  };
  const previousSong = () => {
    if (queue.current[currentSong.current - 1]) {
      lastPaused.current = 0;
      currentSong.current--;
      initAudio(queue.current[currentSong.current].url);
    } else {
      lastPaused.current = 0;
      initAudio(queue.current[currentSong.current].url);
    }
  };

  const shuffleSongs = () => {
    const { queue: newQueue, currentSong: newCurrentSong } = shuffleArray(
      queue.current,
      currentSong.current
    );
    queue.current = newQueue;
    currentSong.current = newCurrentSong;
    setSongList(mapQueueToSongList(queue.current));
  };
  const addFiles = async (
    files: File[],
    rejected: FileRejection[],
    event: DropEvent
  ) => {
    setLoading(true);
    setProgress({ current: 0, total: files.length });
    for await (let file of files as File[] & { buffer: ArrayBuffer }[]) {
      const tags = await getTags(file);
      let coverURL: string = "";
      if (tags.picture)
        coverURL = URL.createObjectURL(
          new Blob([Buffer.from(tags.picture?.data)])
        );
      const newFile: File = {
        ...file,
        name: file.name.replace(new RegExp(ACCEPT.join("|"), "g"), ""),
      };
      const buffer: ArrayBuffer | null = await file.arrayBuffer();
      const url = window.URL.createObjectURL(new Blob([buffer]));
      const id = genID(5);
      const length = queue.current.length;
      queue.current = [
        ...queue.current,
        { url, file: newFile, id, tags, coverURL },
      ];
      setSongList(mapQueueToSongList(queue.current));

      if (length === 0 || ended.current) {
        currentSong.current++;
        initAudio(url);
      }

      setProgress((e) => ({ ...e, current: e.current + 1 }));
    }
    if (getBool("autoshuffle")) shuffleSongs();
    setLoading(false);
  };
  const toggleLoop = () => {
    audio.current.loop = !loop;
    setLoop((e) => !e);
  };
  const togglePlay = () => {
    if (!audio.current) return;
    if (!isPlaying) {
      audio.current.play();
      isPlayingStatic.current = true;
      setIsPlaying(true);
    } else {
      audio.current.pause();
      isPlayingStatic.current = false;
      setIsPlaying(false);
    }
  };

  const dropSong = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    const currentID = queue.current[currentSong.current].id;
    const [removed] = queue.current.splice(source.index, 1);
    queue.current.splice(destination.index, 0, removed);
    if (currentSong.current === source.index)
      currentSong.current = destination.index;
    else
      currentSong.current = queue.current.findIndex((e) => e.id === currentID);
    setSongList(mapQueueToSongList(queue.current));
  };

  const changeVolume = (e, value) => {
    audio.current.volume = value / 100;
    setVolume(value);
  };
  const deleteSong = () => {
    setClickMenuAnchorEl(null);
    if (clickMenuID) {
      const index = queue.current.findIndex((e) => e.id === clickMenuID);
      if (index !== -1) {
        queue.current.splice(index, 1);
        setSongList(mapQueueToSongList(queue.current));
        if (index === currentSong.current) {
          currentSong.current--;
          ended.current = nextSong();
        }
      }
    }
  };

  const songProps: Partial<SongPropsType> = {
    lastPaused,
    currentSong,
    initAudio,
    queue,
    setClickMenuAnchorEl,
    setClickMenuID,
  };
  const controlsProps: ControlsPropsType = {
    nextSong,
    previousSong,
    toggleLoop,
    togglePlay,
    loop,
    isPlaying,
    shuffleSongs,
  };
  const playerProps: PlayerPropsType = {
    songList,
    setAnchorElSettings,
    setAnchorElVolume,
    currentSong,
    songPlaying,
    songProgress,
    controlsProps,
    audio,
  };
  const fileInputProps: FileInputPropsType = {
    addFiles,
    ACCEPT,
    loading,
    progress,
  };

  return (
    <div className={classes.root}>
      <Grid container direction="row" spacing={5} alignItems="flex-start">
        <Grid item xs className={classes.playerRoot}>
          <Player {...playerProps} />
        </Grid>
        <Grid item xs className={classes.songListRoot}>
          <FileInput {...fileInputProps} />
          <DragDropContext onDragEnd={dropSong}>
            <Droppable droppableId="songs">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={classes.listRoot}
                >
                  <List className={classes.songList}>
                    {songList.map((song, i) => (
                      <SongT
                        {...songProps}
                        song={song}
                        index={i}
                        key={song.id}
                      />
                    ))}
                  </List>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>
      </Grid>
      <Menu
        open={isVolumeMenuOpen}
        anchorEl={anchorElVolume}
        onClose={() => setAnchorElVolume(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        getContentAnchorEl={null}
        classes={{
          paper: classes.volume,
        }}
      >
        <Slider
          min={0}
          max={100}
          value={volume}
          onChange={changeVolume}
          style={{ height: 100, padding: 15, marginTop: 10, marginBottom: -3 }}
          orientation="vertical"
        />
      </Menu>

      <Menu
        open={Boolean(clickMenuAnchorEl)}
        onClose={() => {
          setClickMenuAnchorEl(null);
          setClickMenuID(null);
        }}
        anchorEl={clickMenuAnchorEl}
        keepMounted
        getContentAnchorEl={null}
        classes={{
          paper: classes.rightClick,
        }}
      >
        <MenuItem style={{ borderRadius: 3 }} onClick={deleteSong}>
          <Delete style={{ marginRight: 10, marginLeft: -5 }} />
          Delete
        </MenuItem>
      </Menu>

      <Menu
        open={isSettingsMenuOpen}
        anchorEl={anchorElSettings}
        onClose={() => setAnchorElSettings(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        keepMounted
        getContentAnchorEl={null}
      >
        <MenuItem button={false} style={{ flexDirection: "column" }}>
          <FormGroup>
            <FormLabel>Auto-Shuffle on add</FormLabel>
            <Tooltip
              title={
                <Typography variant="body2" style={{ textAlign: "center" }}>
                  Shuffle the playlist when you add new songs
                </Typography>
              }
              placement="bottom"
              arrow
              enterDelay={1000}
              enterTouchDelay={1000}
              enterNextDelay={1000}
            >
              <Checkbox
                disableRipple
                style={{ backgroundColor: "transparent" }}
                onChange={(e) => setBool("autoshuffle", e.target.checked)}
                defaultChecked={getBool("autoshuffle")}
              />
            </Tooltip>
          </FormGroup>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default App;
