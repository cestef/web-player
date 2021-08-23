import FileInput from "./FileInput";
import { FileInputPropsType } from "./FileInput";
import { InputType } from "../App";
import YoutubeInput from "./YoutubeInput";
import SoundCloudInput from "./SoundCloudInput";
import { IconButton, makeStyles } from "@material-ui/core";
import { ExpandMore as More } from "@material-ui/icons";

export interface RootInputPropsType {
    fileInputProps: FileInputPropsType;
    inputMode: InputType;
    setMoreAnchorEl: (value: React.SetStateAction<HTMLElement>) => void;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    more: {
        marginLeft: 10,
    },
}));

const Root = ({ fileInputProps, inputMode, setMoreAnchorEl }: RootInputPropsType) => {
    const classes = useStyles();

    const getInput = (mode: InputType) => {
        switch (mode) {
            case "file":
                return <FileInput {...fileInputProps} />;
            case "youtube":
                return <YoutubeInput />;
            case "soundcloud":
                return <SoundCloudInput />;
        }
    };

    return (
        <div className={classes.root}>
            {getInput(inputMode)}{" "}
            <IconButton className={classes.more} onClick={(e) => setMoreAnchorEl(e.currentTarget)}>
                <More />
            </IconButton>
        </div>
    );
};

export default Root;
