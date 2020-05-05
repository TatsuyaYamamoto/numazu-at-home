import React, { FC, forwardRef } from "react";

import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@material-ui/core";

interface SearchResultListItemProps {
  text: string;
  authorDisplayName?: string;
  authorUserName: string;
  authorProfileImageUrl: string;
}

const SearchResultListItem: FC<SearchResultListItemProps> = forwardRef(
  (props, ref) => {
    const {
      text,
      authorUserName,
      authorDisplayName,
      authorProfileImageUrl,
      ...others
    } = props;
    return (
      <ListItem alignItems="flex-start" innerRef={ref} {...others}>
        <ListItemAvatar>
          <Avatar alt={authorUserName} src={authorProfileImageUrl} />
        </ListItemAvatar>
        <ListItemText
          primary={authorDisplayName || authorUserName}
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                // className={classes.inline}
                color="textPrimary"
              >
                {text}
              </Typography>
            </>
          }
        />
      </ListItem>
    );
  }
);

export default SearchResultListItem;
