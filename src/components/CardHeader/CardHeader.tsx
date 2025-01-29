
import cns from 'classnames';
import './CardHeader.css';
import DeleteIcon from '@mui/icons-material/Delete';


interface CardHeaderProps {
  hide?: boolean;
  onClickDelete?: () => void
}

export const CardHeader = (props: CardHeaderProps) => {
  const {
    hide,
    onClickDelete
  } = props;

  return (
    <div className={cns('CardHeader', { hide })}>
      <div className="left">

      </div>
      <div className="expand" />
      <div className="right">
        {onClickDelete && <DeleteIcon className="icon" onClick={onClickDelete} fontSize="small" />}
      </div>
    </div>
  )
}
