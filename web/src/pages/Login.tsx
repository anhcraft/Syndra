import React, {ComponentProps} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {Theme} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {createStyles, Paper, withStyles, withTheme} from "@material-ui/core";
import background from "../resources/background.jpg"
import api from "../api";
import ReactDOM from "react-dom";
import Register from "./Register";
import Recovery from "./Recovery";

const useStyles = createStyles((theme: Theme) => ({
    container: {
        paddingTop: theme.spacing(7)
    },
    paper: {
        width: theme.spacing(70),
        marginTop: theme.spacing(3),
        margin: "auto",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(2, 3)
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    background: {
        position: "fixed",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -2
    },
    overlay: {
        position: "fixed",
        backgroundColor: "#000",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -1,
        opacity: 0.5
    }
}));

interface IState {
    online: number;
    code: number;
}

class Login extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            online: 0,
            code: -1
        };
    }

    componentDidMount() {
        api.getOnlinePlayers((res: number) => {
            this.setState({
                online: res
            })
        })
    }

    render() {
        const classes = this.props.classes;
        return (
            <Container component="main" className={classes.container}>
                <div className={classes.background}/>
                <div className={classes.overlay}/>
                <CssBaseline />
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon fontSize="large" />
                    </Avatar>
                    <Typography component="h1" variant="h5">Đăng nhập MineHot</Typography>
                    <form className={classes.form} onSubmit={this.handleSubmit.bind(this)} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="user"
                            label="Tài khoản"
                            name="user"
                            autoFocus
                            error={this.state.code > 0}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="pass"
                            label="Mật khẩu"
                            type="password"
                            id="pass"
                            error={this.state.code > 0}
                        />
                        <Typography>
                            {this.state.code == 1 && "Vui lòng nhập tài khoản và mật khẩu!"}
                            {this.state.code == 2 && "Không tìm thấy tài khoản. Vui lòng đăng ký!"}
                            {this.state.code == 3 && "Sai mật khẩu!"}
                            {this.state.code == 4 && "Lỗi xử lý. Vui lòng báo lại admin!"}
                        </Typography>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Đăng nhập
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2" onClick={this.openRecovery}>
                                    {"Quên mật khẩu?"}
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="#" variant="body2" onClick={this.openRegister}>
                                    {"Chưa có tài khoản?"}
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
                <Paper className={classes.paper}>
                    <b>IP Server: Minehot.com | Online: {this.state.online}</b>
                </Paper>
            </Container>
        );
    }

    handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        const form = event.target as HTMLFormElement;
        const user = (form.elements.namedItem("user") as HTMLInputElement).value.trim();
        const pass = (form.elements.namedItem("pass") as HTMLInputElement).value.trim();
        if(user.length == 0 || pass.length == 0) {
            this.setState({code: 1});
            return;
        }
        api.logIn(user, pass, (res: any) => {
            if(res == null) {
                this.setState({code: 4});
                return;
            }
            if(res["code"] as number == 0) {
                api.setToken(res["token"]);
                window.location.reload(true);
            } else {
                this.setState({
                   code: res["code"] as number
                });
            }
        });
    }

    openRegister(e: any){
        ReactDOM.render(
            <Register/>,
            document.getElementById('root')
        )
    }

    openRecovery(e: any) {
        ReactDOM.render(
            <Recovery/>,
            document.getElementById('root')
        )
    }
}

export default withTheme(withStyles(useStyles)(Login));
