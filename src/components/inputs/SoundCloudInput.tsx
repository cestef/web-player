import { TextField, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    input: {
        width: 350,
        [theme.breakpoints.down("md")]: {
            width: "calc(100vw - 128px)",
        },
    },
}));

const SoundCloudInput = () => {
    const classes = useStyles();
    return (
        <TextField
            className={classes.input}
            fullWidth
            autoFocus
            label="SoundCloud URL"
            placeholder="https://soundcloud.com/doomgrip776/rick-astley-never-gonna-give-you-up-airhorn-remix"
            variant="outlined"
        />
    );
};

export default SoundCloudInput;
