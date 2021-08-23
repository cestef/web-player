import { IconButton, makeStyles, Typography } from "@material-ui/core";
import { Add, ExpandMore as More } from "@material-ui/icons";
import Dropzone, { DropEvent, FileRejection } from "react-dropzone";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  input: {
    padding: 15,
    width: 350,
    [theme.breakpoints.down("md")]: {
      width: "calc(100vw - 128px)",
    },
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='5' ry='5' stroke='white' stroke-width='4' stroke-dasharray='12%2c12%2c12' stroke-dashoffset='13' stroke-linecap='square'/%3e%3c/svg%3e");`,
    borderRadius: 5,
  },
  youtube: {
    marginLeft: 10,
  },
}));

export interface FileInputPropsType {
  addFiles: (
    files: File[],
    rejected: FileRejection[],
    event: DropEvent
  ) => Promise<void>;
  ACCEPT: string[];
  loading: boolean;
  progress: {
    current: number;
    total: number;
  };
  setMoreAnchorEl: (value: React.SetStateAction<HTMLElement>) => void;
}

const FileInput = ({
  addFiles,
  ACCEPT,
  loading,
  progress,
  setMoreAnchorEl,
}: FileInputPropsType) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Dropzone onDrop={addFiles} accept={ACCEPT}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} multiple disabled={loading} />
            <div className={classes.input}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Add
                  style={{
                    margin: "auto",
                    marginRight: 8,
                  }}
                />
                <Typography variant="h5">
                  {loading
                    ? `Converting... ${progress.current}/${progress.total}`
                    : isDragActive
                    ? "Drop your files here !"
                    : "Drag your files or click here"}
                </Typography>
              </div>
            </div>
          </div>
        )}
      </Dropzone>
      <IconButton
        className={classes.youtube}
        onClick={(e) => setMoreAnchorEl(e.currentTarget)}
      >
        <More />
      </IconButton>
    </div>
  );
};

export default FileInput;
