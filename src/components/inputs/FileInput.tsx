import { makeStyles, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import Dropzone, { DropEvent, FileRejection } from "react-dropzone";
import { getTags, getHash, genID, mapQueueToSongList, getBool } from "../../functions";
import { SetStateAction, MutableRefObject } from "react";
import { PartialSong, Song } from "../App";

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
}));

export interface FileInputPropsType {
    ACCEPT: string[];
    loading: boolean;
    progress: {
        current: number;
        total: number;
    };
    queue: MutableRefObject<Song[]>;
    setLoading: (value: SetStateAction<boolean>) => void;
    setProgress: (value: SetStateAction<{ total: number; current: number }>) => void;
    setSongList: (value: SetStateAction<PartialSong[]>) => void;
    initAudio: (url: string, volume?: number) => Promise<void>;
    shuffleSongs: () => void;
    ended: MutableRefObject<boolean>;
    currentSong: MutableRefObject<number>;
}

const FileInput = ({
    ACCEPT,
    loading,
    progress,
    setLoading,
    setProgress,
    setSongList,
    queue,
    ended,
    initAudio,
    shuffleSongs,
    currentSong,
}: FileInputPropsType) => {
    const classes = useStyles();
    const addFiles = async (files: File[], rejected: FileRejection[], event: DropEvent) => {
        setLoading(true);
        setProgress({ current: 0, total: files.length });
        for await (let file of files as File[] & { buffer: ArrayBuffer }[]) {
            const tags = await getTags(file);
            const buffer = await file.arrayBuffer();
            const hash = getHash(buffer);
            let coverURL: string = "";
            if (tags.picture)
                coverURL = URL.createObjectURL(new Blob([Buffer.from(tags.picture?.data)]));
            const newFile: File = {
                ...file,
                name: file.name.replace(new RegExp(ACCEPT.join("|"), "g"), ""),
            };
            const url = window.URL.createObjectURL(new Blob([buffer]));
            const id = genID(5);
            const length = queue.current.length;
            queue.current = [...queue.current, { url, file: newFile, id, tags, coverURL, hash }];
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
        </div>
    );
};

export default FileInput;
