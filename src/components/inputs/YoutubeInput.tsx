import { TextField, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    input: {
        width: 350,
        [theme.breakpoints.down("md")]: {
            width: "calc(100vw - 128px)",
        },
    },
}));

const YoutubeInput = () => {
    const classes = useStyles();
    return (
        <TextField
            className={classes.input}
            fullWidth
            autoFocus
            label="Youtube URL"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            variant="outlined"
        />
    );
};

export default YoutubeInput;
