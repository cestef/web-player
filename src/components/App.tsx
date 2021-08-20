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
  Typography
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { Tags } from "jsmediatags";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { DropEvent, FileRejection } from "react-dropzone";
import {
  genID,
  getAudioBuffer,
  getBool,
  getTags,
  mapQueueToSongList,
  playAudio,
  setBool,
  shuffleArray
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
  buffer?: AudioBuffer;
  file: File & { buffer: ArrayBuffer };
  id: string;
  tags: Tags;
  coverURL?: string;
}
export interface PartialSong {
  name: string;
  id: string;
  duration: number;
  tags: Tags;
  coverURL?: string;
}

const App = ({
  setTheme,
}: {
  setTheme: (value: SetStateAction<string>) => void;
}) => {
  const classes = useStyles();

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
  const [showConvert, setShowConvert] = useState<boolean>(
    getBool("showconvert")
  );
  const ctx = new AudioContext();
  const source = useRef<AudioBufferSourceNode>();
  const gainNode = useRef<GainNode>();

  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (
        queue.current[currentSong.current] &&
        isPlayingStatic.current &&
        !ended.current
      ) {
        setSongProgress(
          ((Date.now() - startTime.current) /
            (queue.current[currentSong.current].buffer?.duration * 1000)) *
            100
        );
      } else if (songProgress !== 0 && ended.current) {
        setSongProgress(0);
      }
    }, 1000);
    const titleInterval = setInterval(() => {
      if (songPlaying) document.title = songPlaying;
      else document.title = "cstef's Web Player";
    }, 5000);
    return () => {
      clearInterval(updateInterval);
      clearInterval(titleInterval);
    };
  }, []);
  const initAudio = async (buffer: AudioBuffer, volume: number = 1) => {
    const newBuffer = await playAudio({
      source,
      buffer,
      volume,
      ctx,
      queue,
      currentSong,
      nextSong,
      setIsPlaying,
      setSongPlaying,
      gainNode,
      startTime,
      lastPaused,
      isPlayingStatic,
      ended,
    });
    if (!queue.current[currentSong.current].buffer) {
      queue.current[currentSong.current].buffer = newBuffer;
      setSongList(mapQueueToSongList(queue.current));
    }
  };

  const nextSong = () => {
    if (queue.current[currentSong.current + 1]) {
      currentSong.current++;
      lastPaused.current = 0;
      initAudio(queue.current[currentSong.current].buffer);
      return false;
    }
    return true;
  };
  const previousSong = () => {
    if (queue.current[currentSong.current - 1]) {
      lastPaused.current = 0;
      currentSong.current--;
      initAudio(queue.current[currentSong.current].buffer);
    } else {
      lastPaused.current = 0;
      initAudio(queue.current[currentSong.current].buffer);
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
      const newFile: File & { buffer: ArrayBuffer } = {
        ...file,
        name: file.name.replace(new RegExp(ACCEPT.join("|"), "g"), ""),
        buffer: await file.arrayBuffer(),
      };
      let buffer: AudioBuffer | null = null;
      if (!getBool("convertonplay"))
        buffer = await getAudioBuffer(ctx, newFile);

      const id = genID(5);
      const length = queue.current.length;
      queue.current = [
        ...queue.current,
        { buffer, file: newFile, id, tags, coverURL },
      ];
      setSongList(mapQueueToSongList(queue.current));

      if (length === 0 || ended.current) {
        currentSong.current++;
        initAudio(buffer);
      }

      setProgress((e) => ({ ...e, current: e.current + 1 }));
    }
    if (getBool("autoshuffle")) shuffleSongs();
    setLoading(false);
  };
  const toggleLoop = () => {
    source.current.loop = !loop;
    setLoop((e) => !e);
  };
  const togglePlay = () => {
    if (!source.current) return;
    if (!isPlaying) {
      initAudio(source.current.buffer);
      isPlayingStatic.current = true;
      setIsPlaying(true);
    } else {
      lastPaused.current = (Date.now() - startTime.current) / 1000;
      source.current.onended = null;
      source.current.stop();
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
    setVolume(value);
    lastPaused.current = (Date.now() - startTime.current) / 1000;
    initAudio(queue.current[currentSong.current]?.buffer, value / 100);
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
    showConvert,
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
          <FormGroup style={{ marginTop: 10 }}>
            <FormLabel>Convert on Play</FormLabel>
            <Tooltip
              title={
                <Typography variant="body2" style={{ textAlign: "center" }}>
                  Only decode audio data when you play the file (useful when you
                  need to load big playlists)
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
                onChange={(e) => setBool("convertonplay", e.target.checked)}
                defaultChecked={getBool("convertonplay")}
              />
            </Tooltip>
          </FormGroup>
          <FormGroup style={{ marginTop: 10 }}>
            <FormLabel>Show convert status</FormLabel>
            <Tooltip
              title={
                <Typography variant="body2" style={{ textAlign: "center" }}>
                  Display a little icon next to each song with its convert
                  status (useful when Convert on play is enabled)
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
                checked={showConvert}
                style={{ backgroundColor: "transparent" }}
                onChange={(e) => {
                  setBool("showconvert", e.target.checked);
                  setShowConvert(e.target.checked);
                }}
              />
            </Tooltip>
          </FormGroup>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default App;
