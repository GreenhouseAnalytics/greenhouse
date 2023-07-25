import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  ChangeEvent,
} from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { Menu, MenuButton, MenuPopover } from "@reach/menu-button";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import { blankButton } from "./shared.css";
import * as styles from "./EventSelector.css";

type Props = {
  onSelect: (event: string) => void;
};
export default React.memo(function EventSelector({ onSelect }: Props) {
  const [eventList, setEventList] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const searchField = useRef<HTMLInputElement>(null);
  const ref = useRef();

  /**
   * Load events
   */
  useEffect(() => {
    axios
      .get<{ events: string[] }>("http://localhost:3000/api/data/events")
      .then(({ data }) => {
        setEventList(data.events);
      });
  }, []);

  /**
   * Search value has changed
   */
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }, []);

  /**
   * When the user clicks to open the selector
   */
  const handleOpenClick = useCallback(() => {
    setSearchValue("");
    if (searchField.current) {
      searchField.current.focus();
    }
  }, []);

  /**
   * An event has been selected
   */
  const handleSelect = useCallback(
    (item: string) => {
      onSelect(item);
      if (searchField.current) {
        searchField.current.blur();
      }
    },
    [onSelect]
  );

  return (
    <Menu>
      <MenuButton className={blankButton} onClick={handleOpenClick}>
        <PlusCircleIcon height={24} />
      </MenuButton>
      <MenuPopover className={styles.popover}>
        <Combobox className={styles.comboBox} onSelect={handleSelect}>
          <ComboboxInput
            ref={searchField}
            className={styles.input}
            id="event-name-field"
            placeholder="Search"
            value={searchValue}
            onChange={handleChange}
          />
          <ComboboxPopover
            className={styles.searchResults}
            style={{ width: "auto" }}
            portal={false}
          >
            <ComboboxList>
              {eventList.map((name) => (
                <ComboboxOption
                  key={name}
                  value={name}
                  className={styles.resultOption}
                />
              ))}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
      </MenuPopover>
    </Menu>
  );
});
