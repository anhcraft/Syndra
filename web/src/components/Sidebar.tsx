import React, {ComponentProps} from 'react';
import Avatar from '@material-ui/core/Avatar';
import {Theme} from '@material-ui/core/styles';
import {
    AppBar,
    createStyles, createTheme,
    Divider,
    Drawer, IconButton, List,
    ListItem, ListItemIcon, ListItemText, Toolbar, Typography, withStyles,
    withTheme
} from "@material-ui/core";
import api from "../api";
import {AccountInfo} from "../AccountInfo";
import PaymentIcon from '@material-ui/icons/Payment';
import PersonIcon from '@material-ui/icons/Person';
import { ThemeProvider } from '@material-ui/core';
import ReactDOM from "react-dom";
import Donate from "../pages/Donate";
import Profile from "../pages/Profile";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';
import ChangeEmail from "../pages/ChangeEmail";
import ChangePassword from "../pages/ChangePassword";
import DonationStats from "../pages/DonationStats";

const darkTheme = createTheme({
    palette: {
        type: 'dark',
    },
});

const drawerWidth = 240;

const useStyles = createStyles((theme: Theme) => ({
    avatar: {
        margin: "auto",
        marginTop: theme.spacing(5),
        marginBottom: theme.spacing(5),
        width: theme.spacing(20),
        height: theme.spacing(20)
    },
    appBar: {
        background: "linear-gradient(107deg, rgba(101,50,119,1) 0%, rgba(82,90,215,1) 100%)",
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap'
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(8) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    }
}));

interface IState {
    info: AccountInfo;
    open: boolean;
}

class Sidebar extends React.Component<ComponentProps<any>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            info: {
                user: "",
                email: "",
                admin: false
            },
            open: true
        };
    }

    componentDidMount() {
        api.getInfo((res: AccountInfo) => {
            console.log(res)
            this.setState({
                info: res
            })
        })
    }

    render() {
        const classes = this.props.classes;

        const handleDrawerOpen = () => {
            this.setState({
                open: true
            })
        };

        const handleDrawerClose = () => {
            this.setState({
                open: false
            })
        };

        return (
            <ThemeProvider theme={darkTheme}>
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                        [classes.appBarShift]: this.state.open,
                    })}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            className={clsx(classes.menuButton, {
                                [classes.hide]: this.state.open,
                            })}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            MineHot Minecraft Server
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    className={clsx(classes.drawer, {
                        [classes.drawerOpen]: this.state.open,
                        [classes.drawerClose]: !this.state.open,
                    })}
                    classes={{
                        paper: clsx({
                            [classes.drawerOpen]: this.state.open,
                            [classes.drawerClose]: !this.state.open,
                        }),
                    }}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    {this.state.info.user.length != 0 && <Avatar src={"https://minotar.net/avatar/" + this.state.info.user} className={clsx(classes.avatar, {
                        [classes.hide]: !this.state.open,
                    })}/>}
                    <List>
                        <ListItem button onClick={this.openProfile}>
                            <ListItemIcon>
                                <PersonIcon/>
                            </ListItemIcon>
                            <ListItemText primary={this.state.info.user} />
                        </ListItem>
                        <ListItem button onClick={this.changeEmail}>
                            <ListItemIcon>
                                <EmailIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Đổi email" />
                        </ListItem>
                        <ListItem button onClick={this.changePassword}>
                            <ListItemIcon>
                                <LockIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Đổi mật khẩu" />
                        </ListItem>
                    </List>
                    <Divider />
                    <List>
                        <ListItem button onClick={this.openDonation}>
                            <ListItemIcon>
                                <PaymentIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Nạp thẻ" />
                        </ListItem>
                    </List>
                    {this.state.info.admin &&
                        (<div>
                            <Divider />
                            <List>
                                <ListItem button onClick={this.donationStats}>
                                    <ListItemIcon>
                                        <PaymentIcon/>
                                    </ListItemIcon>
                                    <ListItemText primary="Thống kê nạp thẻ" />
                                </ListItem>
                            </List>
                        </div>)
                    }
                    <Divider />
                    <ListItem button onClick={this.logout}>
                        <ListItemIcon>
                            <ExitToAppIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Đăng xuất" />
                    </ListItem>
                </Drawer>
            </ThemeProvider>
        );
    }

    openProfile(e: any) {
        ReactDOM.render(
            <Profile/>,
            document.getElementById('root')
        )
    }

    openDonation(e: any) {
        ReactDOM.render(
            <Donate/>,
            document.getElementById('root')
        )
    }

    logout(e: any) {
        api.setToken(null);
        window.location.reload(true);
    }

    changeEmail(e: any) {
        ReactDOM.render(
            <ChangeEmail/>,
            document.getElementById('root')
        )
    }

    changePassword(e: any) {
        ReactDOM.render(
            <ChangePassword/>,
            document.getElementById('root')
        )
    }

    donationStats(e: any) {
        ReactDOM.render(
            <DonationStats/>,
            document.getElementById('root')
        )
    }
}

export default withTheme(withStyles(useStyles)(Sidebar));
