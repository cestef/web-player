import {
  Box,
  IconButton,
  makeStyles,
  Slider,
  Typography
} from "@material-ui/core";
import { MusicNote, Settings, VolumeUp } from "@material-ui/icons";
import { MutableRefObject, SetStateAction } from "react";
import { formatMilliseconds } from "../functions";
import { PartialSong } from "./App";
import Controls from "./Controls";

const useStyles = makeStyles((theme) => ({
  progress: {
    [theme.breakpoints.down("xs")]: {
      width: "min-content",
    },
    width: 550,
    marginTop: 50,
  },
  player: {
    [theme.breakpoints.up("lg")]: {
      marginTop: 100,
    },
    [theme.breakpoints.up("lg")]: {
      position:"sticky",
      top:0
    },
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cover: {
    height: 250,
    width: 250,
    borderRadius: 5,
    marginBottom: 50,
    pointerEvents: "none",
  },
  progressBar: {
    [theme.breakpoints.down("xs")]: {
      width: "calc(60vw - 64px)",
    },
    width: 375,
  },
}));

export interface PlayerPropsType {
  songList: PartialSong[];
  currentSong: MutableRefObject<number>;
  songPlaying: string;
  setAnchorElSettings: (value: SetStateAction<HTMLElement>) => void;
  setAnchorElVolume: (value: SetStateAction<HTMLElement>) => void;
  songProgress: number;
  controlsProps: any;
  audio: MutableRefObject<HTMLAudioElement>;
  seek: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
}
const Player = ({
  songList,
  currentSong,
  songPlaying,
  setAnchorElSettings,
  songProgress,
  setAnchorElVolume,
  controlsProps,
  audio,
  seek,
}: PlayerPropsType) => {
  const classes = useStyles();
  return (
    <div className={classes.player}>
      {songList[currentSong.current]?.coverURL ? (
        <img
          src={songList[currentSong.current]?.coverURL}
          alt="Cover"
          className={classes.cover}
        />
      ) : (
        <MusicNote className={classes.cover} />
      )}

      <Typography variant="h4">
        {songList[currentSong.current]?.tags.title ||
          songPlaying ||
          "Nothing is playing"}
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        style={{ marginTop: 10 }}
      >
        {songList[currentSong.current]?.tags.artist || "Unknown artist"}
      </Typography>

      <div className={classes.progress}>
        <Box display="flex" alignItems="center">
          <Box>
            <IconButton onClick={(e) => setAnchorElSettings(e.currentTarget)}>
              <Settings />
            </IconButton>
          </Box>

          <Box minWidth={35}>
            <Typography variant="body2" color="textSecondary">
              {audio.current && audio.current.duration && songProgress
                ? formatMilliseconds(
                    (songProgress / 100) * (audio.current.duration * 1000)
                  )
                : "0:00"}
            </Typography>
          </Box>

          <Box mr={1} ml={1}>
            <Slider
              value={songProgress}
              onChange={seek}
              className={classes.progressBar}
              min={0}
              max={100}
            />
          </Box>

          <Box minWidth={35}>
            <Typography variant="body2" color="textSecondary">
              {songList[currentSong.current] && audio.current.duration
                ? formatMilliseconds(audio.current.duration * 1000)
                : "0:00"}
            </Typography>
          </Box>

          <Box>
            <IconButton onClick={(e) => setAnchorElVolume(e.currentTarget)}>
              <VolumeUp />
            </IconButton>
          </Box>
        </Box>
      </div>
      <Controls {...controlsProps} />
    </div>
  );
};

export default Player;
