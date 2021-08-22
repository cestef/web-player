import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  makeStyles,
  Menu,
  MenuItem,
  Slider,
  TextField,
  Typography,
} from "@material-ui/core";
import { Delete, Edit, GetApp, Publish } from "@material-ui/icons";
import { saveAs } from "file-saver";
import { Tags } from "jsmediatags";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { DropEvent, FileRejection } from "react-dropzone";
import {
  genID,
  getBool,
  getHash,
  getTags,
  mapQueueToSongList,
  playAudio,
  setBool,
  shuffleArray,
} from "../functions";
import { ControlsPropsType } from "./Controls";
import FileInput, { FileInputPropsType } from "./FileInput";
import MenuBox from "./MenuBox";
import Player, { PlayerPropsType } from "./Player";
import SongT, { SongPropsType } from "./Song";

const ACCEPT = [".mp3", ".mp4", ".m4v", ".flac", ".mov", ".ogg"];

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 5,
      margin: 0,
    },
    padding: 20,
    margin: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    flexDirection: "column",
    overflowX: "hidden",
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
  hash: string;
}
export interface PartialSong {
  name: string;
  id: string;
  tags: Tags;
  coverURL?: string;
  hash: string;
}
export interface Playlist {
  name: string;
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
  const startTime = useRef<number>();
  const isPlayingStatic = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [openEditPlaylist, setOpenEditPlaylist] = useState(false);
  const [playlist, setPlaylist] = useState<Playlist>({
    name: "Untitled playlist",
  });
  const [playlistNameInput, setPlaylistNameInput] = useState("");
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
    const keyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowRight":
          ended.current = nextSong();
          break;
        case "ArrowLeft":
          previousSong();
          break;
      }
    };
    window.addEventListener("keydown", keyDown);
    return () => {
      window.removeEventListener("keypress", keyDown);
      clearInterval(updateInterval);
      clearInterval(titleInterval);
    };
  }, []);
  const initAudio = async (url: string, volume: number = 1) => {
    if (ended.current && queue.current.length > 0) {
      currentSong.current = 0;
    }
    await playAudio({
      url,
      volume,
      queue,
      currentSong,
      nextSong,
      setIsPlaying,
      setSongPlaying,
      startTime,
      isPlayingStatic,
      ended,
      audio,
      loop,
    });
  };

  const nextSong = () => {
    if (queue.current[currentSong.current + 1]) {
      currentSong.current++;
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
      currentSong.current--;
      initAudio(queue.current[currentSong.current].url);
    } else if (queue.current[currentSong.current]) {
      initAudio(queue.current[currentSong.current].url);
    }
  };

  const shuffleSongs = () => {
    const { queue: newQueue, currentSong: newCurrentSong } = shuffleArray(
      queue.current,
      currentSong.current,
      getBool("keepposition")
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
      const buffer = await file.arrayBuffer();
      const hash = getHash(buffer);
      let coverURL: string = "";
      if (tags.picture)
        coverURL = URL.createObjectURL(
          new Blob([Buffer.from(tags.picture?.data)])
        );
      const newFile: File = {
        ...file,
        name: file.name.replace(new RegExp(ACCEPT.join("|"), "g"), ""),
      };
      const url = window.URL.createObjectURL(new Blob([buffer]));
      const id = genID(5);
      const length = queue.current.length;
      queue.current = [
        ...queue.current,
        { url, file: newFile, id, tags, coverURL, hash },
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
    if (!audio.current) return console.log("No audio");
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
    if (audio.current) audio.current.volume = value / 100;
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

  const seek = (event: React.ChangeEvent<{}>, value: number) => {
    if (!audio.current) return;
    setSongProgress(value);
    audio.current.fastSeek((value / 100) * audio.current.duration);
  };

  const exportPlaylist = () => {
    saveAs(
      new Blob([JSON.stringify(songList.map((e) => e.hash))]),
      playlist.name + ".playlist"
    );
  };
  const startImportPlaylist = () => {
    const input = document.getElementById("playlistinput");
    input.click();
  };
  const importPlaylist = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files[0];
    if (file) {
      const buffer = await file.arrayBuffer();
      let playlist: string[] = [];
      try {
        playlist = JSON.parse(new TextDecoder("utf-8").decode(buffer));
      } catch (e) {
        console.log(e);
      }
      for (let i = 0; i < playlist.length; i++) {
        const currentIndex = queue.current.findIndex(
          (e) => e.hash === playlist[i]
        );
        if (currentIndex !== -1) {
          const [removed] = queue.current.splice(currentIndex, 1);
          if (queue.current[i]) {
            if (currentSong.current === currentIndex) currentSong.current = i;
            queue.current.splice(i, 0, removed);
          } else queue.current.push(removed);
        }
      }
      setSongList(mapQueueToSongList(queue.current));
    }
  };
  const songProps: Partial<SongPropsType> = {
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
    seek,
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      style={{ marginTop: -5, marginLeft: 10 }}
                      onClick={() => setOpenEditPlaylist(true)}
                    >
                      <Edit />
                    </IconButton>
                    <Typography variant="h6">
                      <code>{playlist.name || "Untitled playlist"}</code> | 
                      {songList.length} song{songList.length > 1 ? "s" : ""}
                    </Typography>
                    <IconButton
                      style={{ marginTop: -5, marginLeft: 10 }}
                      onClick={startImportPlaylist}
                    >
                      <GetApp />
                    </IconButton>
                    <input
                      type="file"
                      accept=".playlist"
                      style={{ display: "none" }}
                      id="playlistinput"
                      onChange={importPlaylist}
                    />
                    <IconButton
                      style={{ marginTop: -5, marginLeft: 5 }}
                      onClick={exportPlaylist}
                    >
                      <Publish />
                    </IconButton>
                  </div>

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
        <MenuItem button={false}>
          <Slider
            min={0}
            max={100}
            value={volume}
            onChange={changeVolume}
            style={{
              height: 100,
              marginTop: 15,
              marginBottom: 15,
            }}
            orientation="vertical"
          />
        </MenuItem>
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
          <MenuBox
            onChange={(e) => setBool("autoshuffle", e.target.checked)}
            defaultChecked={getBool("autoshuffle")}
            tooltip="Shuffle the playlist when you add new songs"
            label="Auto-Shuffle on add"
          />
          <MenuBox
            onChange={(e) => setBool("keepposition", e.target.checked)}
            defaultChecked={getBool("keepposition")}
            tooltip="Prevents the currently playing song to be moved from its
            current position in the playlist when shuffling"
            label="Keep current song position"
          />
        </MenuItem>
      </Menu>
      <Dialog
        open={openEditPlaylist}
        onClose={() => setOpenEditPlaylist(false)}
      >
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Playlist Name"
            type="text"
            fullWidth
            value={playlist.name}
            onChange={(e) =>
              setPlaylist((p) => ({ ...p, name: e.target.value }))
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;
