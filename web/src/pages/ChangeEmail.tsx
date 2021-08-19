import React, {ComponentProps} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import {Theme} from '@material-ui/core/styles';
import {
    createStyles, createTheme, Paper, withStyles,
    withTheme
} from "@material-ui/core";
import api from "../api";
import { ThemeProvider } from '@material-ui/core';
import Sidebar from "../components/Sidebar";
import Typography from "@material-ui/core/Typography";
import { Button } from '@material-ui/core';
import ReCAPTCHA from "react-google-recaptcha";

const lightTheme = createTheme({
    palette: {
        type: 'light',
    },
});
const darkTheme = createTheme({
    palette: {
        type: 'dark',
    },
});

const useStyles = createStyles((theme: Theme) => ({
    root: {
        display: 'flex',
    },
    paper: {
        marginTop: theme.spacing(3),
        margin: theme.spacing(3),
        padding: theme.spacing(2, 3)
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        marginTop: theme.spacing(5)
    }
}));

interface IState {
    captcha: string;
    emailCode: number;
}

class ChangeEmail extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            emailCode: -1,
            captcha: ""
        };
    }

    render() {
        const classes = this.props.classes;
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <div className={classes.root}>
                    <Sidebar/>
                    <main className={classes.content}>
                        <Grid container spacing={3}>
                            <ThemeProvider theme={lightTheme}>
                                <Grid item>
                                    <Paper className={classes.paper}>
                                        <Typography component="h5" variant="h5">Đổi email</Typography>
                                        <form className={classes.form} onSubmit={this.changeEmail.bind(this)} noValidate>
                                            <TextField
                                                variant="outlined"
                                                margin="normal"
                                                required
                                                fullWidth
                                                name="email"
                                                label="Email mới"
                                                type="email"
                                                id="email"
                                                error={this.state.emailCode > 0}
                                            />
                                            <p>Bạn vui lòng xác nhận yêu cầu đổi email:</p>
                                            <ReCAPTCHA
                                                sitekey="6LcSvAscAAAAAP9KKw1zKFWt12devap5KnuRGJeD"
                                                hl="vi"
                                                onChange={this.verifyCaptcha.bind(this)}
                                            />
                                            <p>Một bức thư sẽ được gửi tới email mới của bạn. Hãy làm theo hưỡng dẫn trong mail đó để xác nhận!</p>
                                            <Typography>
                                                {this.state.emailCode == 0 && "Một bức thư đã được gửi tới email mới! Hãy vào hòm thư kiểm tra."}
                                                {this.state.emailCode == 1 && "Email không hợp lệ!"}
                                                {this.state.emailCode == 2 && "Vui lòng xác minh captcha!"}
                                                {this.state.emailCode == 3 && "Xác minh captcha thất bại!"}
                                                {this.state.emailCode == 4 && "Lỗi xử lý từ máy chủ. Vui lòng báo lại admin!"}
                                            </Typography>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                className={classes.submit}
                                            >
                                                Đổi email
                                            </Button>
                                            <ul>
                                                <li>Đặt đúng email để có thể lấy lại tài khoản nếu quên mật khẩu</li>
                                            </ul>
                                        </form>
                                    </Paper>
                                </Grid>
                            </ThemeProvider>
                        </Grid>
                    </main>
                </div>
            </ThemeProvider>
        );
    }

    verifyCaptcha(tkn: string | null){
        this.setState({captcha: tkn == null ? "" : tkn})
    }

    changeEmail(event: React.FormEvent) {
        event.preventDefault()
        const form = event.target as HTMLFormElement;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
        if(email.length == 0) {
            this.setState({emailCode: 1})
            return
        }
        if(!(/^\S+@\S+$/.test(email))) {
            this.setState({emailCode: 1})
            return
        }
        if(this.state.captcha.length == 0) {
            this.setState({emailCode: 2});
            return;
        }
        api.changeEmail(email, this.state.captcha, (res: any) => {
            if(res == null) {
                this.setState({emailCode: 4});
                return;
            }
            if(res["code"] as number == 0) {
                this.setState({emailCode: 0});
                setTimeout(function () {
                    window.location.reload(true);
                }, 2000);
            } else {
                this.setState({
                    emailCode: res["code"] as number
                });
            }
        });
    }
}

export default withTheme(withStyles(useStyles)(ChangeEmail));
