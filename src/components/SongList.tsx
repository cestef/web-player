import { IconButton, List, makeStyles, Typography } from "@material-ui/core";
import { Edit, GetApp, Publish } from "@material-ui/icons";
import { SetStateAction } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { PartialSong, Playlist } from "./App";
import SongT, { SongPropsType } from "./Song";

const useStyles = makeStyles((theme) => ({
  listRoot: {
    marginTop: 20,
  },
  songList: {
    marginTop: 20,
    maxWidth: "calc(100vw - 64px)",
  },
}));

export interface SongListPropsType {
  songProps: Partial<SongPropsType>;
  dropSong: (result: DropResult) => void;
  setOpenEditPlaylist: (value: SetStateAction<boolean>) => void;
  playlist: Playlist;
  songList: PartialSong[];
  startImportPlaylist: () => void;
  importPlaylist: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  exportPlaylist: () => void;
}

const SongList = ({
  dropSong,
  setOpenEditPlaylist,
  playlist,
  songList,
  startImportPlaylist,
  importPlaylist,
  exportPlaylist,
  songProps,
}: SongListPropsType) => {
  const classes = useStyles();
  return (
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
                style={{ marginTop: -5, marginRight: 10 }}
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
                style={{ marginTop: -10, marginLeft: 5 }}
                onClick={exportPlaylist}
              >
                <Publish />
              </IconButton>
            </div>

            <List className={classes.songList}>
              {songList.map((song, i) => (
                <SongT {...songProps} song={song} index={i} key={song.id} />
              ))}
            </List>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SongList;
