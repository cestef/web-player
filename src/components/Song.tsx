import { ListItem, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { Check, Error } from "@material-ui/icons";
import { MutableRefObject, SetStateAction } from "react";
import { Draggable } from "react-beautiful-dnd";
import { PartialSong, Song as SongType } from "./App";

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 5,
  },
  song: {
    borderRadius: 5,
    padding: 10,
  },
  convertStatus: {
    marginRight: 5,
  },
}));

export interface SongPropsType {
  song: PartialSong;
  index: number;
  queue?: MutableRefObject<SongType[]>;
  currentSong?: MutableRefObject<number>;
  lastPaused?: MutableRefObject<number>;
  initAudio?: (buffer: AudioBuffer) => void;
  setClickMenuAnchorEl?: (value: SetStateAction<HTMLDivElement>) => void;
  setClickMenuID?: (value: SetStateAction<string>) => void;
  showConvert?: boolean;
}

const Song = ({
  song,
  index,
  queue,
  currentSong,
  lastPaused,
  initAudio,
  setClickMenuAnchorEl,
  setClickMenuID,
  showConvert,
}: SongPropsType) => {
  const classes = useStyles();
  const customMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    setClickMenuID(song.id);
    setClickMenuAnchorEl(event.currentTarget);
  };
  return (
    <div className={classes.root} onContextMenu={customMenu}>
      <Draggable draggableId={song.id} index={index}>
        {(provided) => (
          <ListItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            button
            className={classes.song}
            onClick={() => {
              if (currentSong.current !== index) {
                lastPaused.current = 0;
                currentSong.current = index;
                initAudio(queue.current[index].buffer);
              }
            }}
          >
            {showConvert && (
              <Tooltip
                title={
                  <Typography variant="body2" style={{ textAlign: "center" }}>
                    {song.duration ? "Converted" : "Not Converted"}
                  </Typography>
                }
              >
                {song.duration ? (
                  <Check className={classes.convertStatus} />
                ) : (
                  <Error className={classes.convertStatus} />
                )}
              </Tooltip>
            )}

            <Typography variant="h6">
              {currentSong.current === index ? <u>{song.name}</u> : song.name}
            </Typography>
          </ListItem>
        )}
      </Draggable>
    </div>
  );
};

export default Song;
