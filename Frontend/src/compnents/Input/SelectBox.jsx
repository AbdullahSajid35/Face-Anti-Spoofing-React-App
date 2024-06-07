import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/system";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffffff", // White color for labels and border
    },
    text: {
      primary: "#ffffff", // White color for text
    },
    background: {
      paper: "#333333", // Dark gray background for dropdown items
    },
  },
});

const CustomSelect = styled(Select)(({ theme }) => ({
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "blue",
  },
  color: "white", // White color for the text inside the select
}));

const CustomInputLabel = styled(InputLabel)(({ theme }) => ({
  color: "white",
  "&.Mui-focused": {
    color: "blue",
  },
}));

export default function SelectBox({
  value,
  setValue,
  label = "Not Provide",
  list = ["ten", "twenty", "thirty"],
}) {
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ color: "white" }}>
        <FormControl sx={{ m: 1, minWidth: 120 }} variant="outlined">
          <CustomInputLabel id="demo-simple-select-helper-label">
            {label}
          </CustomInputLabel>
          <CustomSelect
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            value={value}
            label={label}
            onChange={handleChange}
          >
            {list.map((item, idx) => (
              <MenuItem key={idx} value={item}>
                {item}
              </MenuItem>
            ))}
          </CustomSelect>
        </FormControl>
      </div>
    </ThemeProvider>
  );
}
