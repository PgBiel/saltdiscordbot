MUTE_REGEX = r"""
^ # Start of string.
    (?P<all> # User & Time.
      # ( # Possibility 1 starts here. This group is the user name
      #   [\s\S]{1,32} # Any character up to 32 times
      #   |[\s\S]{1,32} # Or, up to 32 times...
      #   \#\d{4} # ...and a discrim.
      # )
      # \s+ # Any whitespace
      [\"']* # Optional quotes
      (?P<time> # The group of time units.
        (?: # First time unit.
          \d+ # Amount of it.
          \s* # Whitespace if you desire.
          (?: # Entering valid time units.
            (?:mo|(?:months?)) # mo, month, months
            |(?:s|(?:sec|second)s?) # s, sec, secs, second, seconds
            |(?:m|(?:min|minute)s?) # m, min, mins, minute, minutes
            |(?:h|(?:hours?)) # h, hour, hours
            |(?:d|(?:days?)) # d, day, days
            |(?:w|(?:weeks?)) # w, week, weeks
            |(?:y|(?:years?)) # y, year, years
          ) # Leaving valid time units.
        ) # End of first time unit.
        (?: # Holder for any extra time units.
          \s* # Whitespace if you want.
          \d+ # Amount of time unit.
          \s* # Optional Whitespace.
          (?: # Once again, entering valid time units.
            (?:mo|(?:months?)) # mo, month, months
            |(?:s|(?:sec|second)s?) # s, sec, secs, second, seconds
            |(?:m|(?:min|minute)s?) # m, min, mins, minute, minutes
            |(?:h|(?:hours?)) # h, hour, hours
            |(?:d|(?:days?)) # d, day, days
            |(?:w|(?:weeks?)) # w, week, weeks
            |(?:y|(?:years?)) # y, year, years
          ) # Leaving valid time units.
        )* # Exiting holder for extra time units. Can be any amount.
      ) # Exiting the group of time units.
      [\"']* # Optional quotes
      (?! # Do not match if there's...
        [^\s] # ...Anything other than whitespace after this.
      )
      | # Possibility 1 ends here. Possibility 2 starts here.
      # ( # User name matching.
      #   [^\s]{1,32} # Any character, matching up to 32 times.
      # )
      # \s+ # Whitespaces
      [\"']* # Optional quotes
      (?P<mins> # Match...
        \d+ # ...Numbers. (Naked numbers are converted to minutes)
      )
      [\"']* # Optional quotes
      (?! # Do not match if there's...
        [^\s] # ...Anything other than whitespace after this.
      )
      | # Possibility 2 ends here, and Possibility 3 starts here.
      # ( # User name matcing.
      #   [^\s]{1,32} # Any character up to 32 times.
      #   \#\d{4} # Discriminator.
      # )
      # \s+ # Whitespaces
      # ["']* # Optional quotes
      (?P<mins2> # Match...
        \d+ # ...Numbers. (Naked numbers are converted to minutes)
      )
      [\"']* # Optional quotes
      (?! # Do not match if there's...
        [^\s] # ...Anything other than whitespace after this.
      )
      | # Possibility 3 ends here, Possibility 4 starts here.
      # ( # Just user name. (Default to 10 min)
      #   [^\s]{1,32} # Match any character up to 32 times...
      #   |[^\s]{1,32} # Or, any character up to 32 times with...
      #   \#\d{4}# ...A discrim.
      # ) # Possibility 4 ends here.
    )? # All the matching ends here. Phew!
    (?: # Reason group.
      (?(all)\s+|\s*) # Whitespace to indicate reason.
      (?P<reason>[\s\S]+) # The reason itself, any character any amount of times.
    )? # It is also optional.
    $ # End of string.
"""