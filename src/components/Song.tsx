import { ListItem, makeStyles, Typography } from "@material-ui/core";
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
  initAudio?: (url: string) => void;
  setClickMenuAnchorEl?: (value: SetStateAction<HTMLDivElement>) => void;
  setClickMenuID?: (value: SetStateAction<string>) => void;
}

const Song = ({
  song,
  index,
  queue,
  currentSong,
  initAudio,
  setClickMenuAnchorEl,
  setClickMenuID,
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
                currentSong.current = index;
                initAudio(queue.current[index].url);
              }
            }}
          >
            <Typography variant="h6">
              <u
                style={{
                  textDecoration: currentSong.current === index ? "" : "none",
                }}
              >
                {(song.tags.artist ? song.tags.artist + " - " : "") +
                  (song.tags.title || song.name)}
              </u>
            </Typography>
          </ListItem>
        )}
      </Draggable>
    </div>
  );
};

export default Song;
