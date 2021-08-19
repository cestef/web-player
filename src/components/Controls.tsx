import { IconButton, makeStyles } from "@material-ui/core";
import {
  Loop,
  Pause,
  PlayArrow,
  Shuffle,
  SkipNext,
  SkipPrevious,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  controls: {
    display: "flex",
    alignItems: "center",
    paddingBottom: theme.spacing(1),
    marginTop: 20,
  },
  playIcon: {
    height: 38,
    width: 38,
  },
}));

export interface ControlsPropsType {
  nextSong: () => void;
  toggleLoop: () => void;
  togglePlay: () => void;
  previousSong: () => void;
  shuffleSongs: () => void;
  isPlaying: boolean;
  loop: boolean;
}

const Controls = ({
  nextSong,
  toggleLoop,
  togglePlay,
  previousSong,
  shuffleSongs,
  isPlaying,
  loop,
}: ControlsPropsType) => {
  const classes = useStyles();
  return (
    <div className={classes.controls}>
      <IconButton onClick={shuffleSongs}>
        <Shuffle />
      </IconButton>
      <IconButton onClick={previousSong}>
        <SkipPrevious />
      </IconButton>
      <IconButton onClick={togglePlay}>
        {isPlaying ? (
          <Pause className={classes.playIcon} />
        ) : (
          <PlayArrow className={classes.playIcon} />
        )}
      </IconButton>
      <IconButton onClick={nextSong}>
        <SkipNext />
      </IconButton>
      <IconButton onClick={toggleLoop}>
        <Loop color={loop ? "inherit" : "disabled"} />
      </IconButton>
    </div>
  );
};

export default Controls;
