import {
  Checkbox,
  FormGroup,
  FormLabel,
  Tooltip,
  Typography,
} from "@material-ui/core";

const MenuBox = ({
  onChange,
  defaultChecked,
  label,
  tooltip,
}: {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  defaultChecked: boolean;
  label: string;
  tooltip: string;
}) => {
  return (
    <FormGroup>
      <FormLabel>{label}</FormLabel>
      <Tooltip
        title={
          <Typography variant="body2" style={{ textAlign: "center" }}>
            {tooltip}
          </Typography>
        }
        placement="bottom"
        arrow
        enterDelay={1000}
        enterTouchDelay={1000}
        enterNextDelay={1000}
      >
        <Checkbox
          disableRipple
          style={{ backgroundColor: "transparent" }}
          onChange={onChange}
          defaultChecked={defaultChecked}
        />
      </Tooltip>
    </FormGroup>
  );
};

export default MenuBox;
