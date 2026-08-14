package services

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

func FetchGoogleSheetRows(sheetURL string) ([][]string, error) {
	sheetID, gid, err := extractSheetDetails(sheetURL)

	if err != nil {
		return nil, err
	}

	csvURL := fmt.Sprintf(
		"https://docs.google.com/spreadsheets/d/%s/gviz/tq?tqx=out:csv&gid=%s",
		sheetID,
		gid,
	)

	resp, err := http.Get(csvURL)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf(
			"google sheets returned status %d",
			resp.StatusCode,
		)
	}

	reader := csv.NewReader(resp.Body)
	reader.FieldsPerRecord = -1

	var rows [][]string

	for {
		record, err := reader.Read()

		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, err
		}

		rows = append(rows, record)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("google sheet is empty")
	}

	return rows, nil
}

func extractSheetDetails(sheetURL string) (string, string, error) {
	re := regexp.MustCompile(`/spreadsheets/d/([a-zA-Z0-9_-]+)`)

	matches := re.FindStringSubmatch(sheetURL)

	if len(matches) < 2 {
		return "", "", fmt.Errorf("invalid Google Sheet URL")
	}

	sheetID := matches[1]

	parsedURL, err := url.Parse(sheetURL)
	if err != nil {
		return "", "", err
	}

	gid := parsedURL.Query().Get("gid")

	if gid == "" {
		gid = "0"
	}

	return sheetID, gid, nil
}

func normalizeHeader(header string) string {
	header = strings.TrimSpace(header)
	header = strings.ToLower(header)

	header = strings.ReplaceAll(header, "/", " ")
	header = strings.ReplaceAll(header, "_", " ")
	header = strings.ReplaceAll(header, "-", " ")

	header = strings.Join(strings.Fields(header), " ")

	return header
}
