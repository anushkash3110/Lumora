package utils

import (
	"encoding/csv"
	"errors"
	"net/http"
	"regexp"
)

func ReadGoogleSheet(sheetURL string) ([][]string, error) {

	re := regexp.MustCompile(`/d/([a-zA-Z0-9-_]+)`)

	match := re.FindStringSubmatch(sheetURL)

	if len(match) < 2 {

		return nil, errors.New("invalid google sheet url")

	}

	sheetID := match[1]

	csvURL := "https://docs.google.com/spreadsheets/d/" +
		sheetID +
		"/export?format=csv"

	resp, err := http.Get(csvURL)

	if err != nil {

		return nil, err

	}

	defer resp.Body.Close()

	reader := csv.NewReader(resp.Body)

	rows, err := reader.ReadAll()

	if err != nil {

		return nil, err

	}

	return rows, nil

}