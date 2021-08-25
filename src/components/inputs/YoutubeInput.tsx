import { makeStyles, TextField } from "@material-ui/core";
import { useState } from "react";
import ytdl from "ytdl-core";

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
    const [inputError, setInputError] = useState<string>("")
    const [URL, setURL] = useState<string>("")
    const changeURL = (e:React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== "") {
            //if (!ytdl.validateURL(e.target.value)) setInputError("Invalid URL")
            //else setInputError("")
        }             
        else setInputError("")
        setURL(e.target.value)
    }
    const submit = async (e:React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !Boolean(inputError)) {
            console.log("start")
            
            const stream = ytdl(URL)
            stream.on("data", (chunk) => {
                console.log(typeof chunk, chunk)
            })
        }
    }
    return (
        <TextField
            className={classes.input}
            fullWidth
            autoFocus
            label="Youtube URL"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            variant="outlined"
            error={Boolean(inputError)}
            helperText={inputError}
            onChange={changeURL}
            value={URL}
            onKeyDown={submit}
        />
    );
};

export default YoutubeInput;
